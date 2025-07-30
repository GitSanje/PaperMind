import {
  BaseCheckpointSaver,
  Checkpoint,
  CheckpointMetadata,
  CheckpointTuple,
} from "@langchain/langgraph";

import { RunnableConfig } from "@langchain/core/runnables";
import { type Redis } from "ioredis";
import {
  ChannelVersions,
  CheckpointListOptions,
} from "@langchain/langgraph-checkpoint";
import { load } from "@langchain/core/load";

function _generateKey(
  threadId: string,
  checkpointNamespace: string,
  checkpointId: string
) {
  return JSON.stringify([threadId, checkpointNamespace, checkpointId]);
}

export class RedisSaver extends BaseCheckpointSaver {
  private redis: Redis;

  constructor(redis: Redis) {
    super();
    this.redis = redis;
  }

  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const { thread_id, checkpoint_id } = config.configurable || {};

    const pdfId = config.configurable?.pdfId;
    const userId = config.configurable?.userId;
    if (!thread_id) return undefined;
    const ckptId = checkpoint_id;

    const zsetKey = `checkpoints:${userId}:${pdfId}:${thread_id}`;

    const allCheckpointIds = await this.redis.zrevrange(zsetKey, 0, -1);
    const key = `checkpoint:${userId}:${pdfId}:${thread_id}:${allCheckpointIds[0]}`;

    try {
      const data = await this.redis.hgetall(key);

      if (!data.checkpoint || !data.metadata) return undefined;
      const checkpoint = await load<Checkpoint>(data.checkpoint);
      const metadata = await load<CheckpointMetadata>(data.metadata);

      const parentConfig = data.parentId
        ? {
            configurable: {
              thread_id,
              checkpoint_id: data.parentId,
            },
          }
        : undefined;

      return {
        config: {
          configurable: {
            thread_id,
            checkpoint_id: ckptId,
          },
        },
        checkpoint,
        metadata,
        parentConfig,
      };
    } catch (err) {
      console.error("Redis getTuple error:", err);
      throw err;
    }
  }

  async *list(
    config: RunnableConfig,
    options?: CheckpointListOptions
  ): AsyncGenerator<CheckpointTuple> {
    const { thread_id } = config.configurable || {};
    if (!thread_id) return;
    const pdfId = config.configurable?.pdfId;
    const userId = config.configurable?.userId;
    const zsetKey = `checkpoints:${userId}:${pdfId}:${thread_id}`;
    let stopIndex = -1;
    //["cp5", "cp4", "cp3", "cp2", "cp1"] // newest → oldest
    //So to list before cp3, you would list items from index 3 onwards → ["cp2", "cp1"]

    if (options?.before?.configurable?.checkpoint_id) {
      // Find the index of the checkpoint before which to list
      const allIds = await this.redis.zrevrange(zsetKey, 0, -1);
      stopIndex = allIds.findIndex(
        (id) => id === options?.before?.configurable?.checkpoint_id
      );
      if (stopIndex === -1) stopIndex = allIds.length; // If not found, list all
    }
    // Get IDs in reverse order (newest first)
    const ids = await this.redis.zrevrange(
      zsetKey,
      stopIndex >= 0 ? stopIndex + 1 : 0,
      stopIndex >= 0 ? stopIndex + options?.limit! : options?.limit! - 1
    );

    for (const checkpoint_id of ids) {
      const key = `checkpoint:${thread_id}:${checkpoint_id}`;
      const data = await this.redis.hgetall(key);

      if (!data?.checkpoint || !data?.metadata) continue;
      yield {
        config: {
          configurable: {
            thread_id,
            checkpoint_id,
          },
        },
        checkpoint: await load<Checkpoint>(data.checkpoint),
        metadata: await load<CheckpointMetadata>(data.metadata),
        parentConfig: data.parentId
          ? {
              configurable: {
                thread_id,
                checkpoint_id: data.parentId,
              },
            }
          : undefined,
      };
    }
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata
  ): Promise<RunnableConfig> {
    const threadId = config.configurable?.thread_id;
    const pdfId = config.configurable?.pdfId;
    const userId = config.configurable?.userId;
    const checkpointId = checkpoint.id;
    const parentId = config.configurable?.checkpoint_id;
    if (!threadId || !checkpointId) {
      throw new Error("Missing thread_id or checkpoint_id");
    }

    const key = `checkpoint:${userId}:${pdfId}:${threadId}:${checkpointId}`;
    const zsetKey = `checkpoints:${userId}:${pdfId}:${threadId}`;

    const checkpointData = {
      checkpoint: JSON.stringify(checkpoint),
      metadata: JSON.stringify(metadata),
      parentId: parentId || "",
    };

    try {
      // Save checkpoint as hash
      await this.redis.hset(key, checkpointData);

      // Use timestamp or score to maintain order in sorted set
      await this.redis.zadd(zsetKey, Date.now(), checkpointId);
    } catch (error) {
      console.error("Error saving checkpoint to Redis", error);
      throw error;
    }

    return {
      configurable: {
        thread_id: threadId,
        checkpoint_id: checkpointId,
      },
    };
  }

  // PUT WRITES — Store intermediate writes
  async putWrites(
    config: RunnableConfig,
    writes: any[],
    taskId: string
  ): Promise<void> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = config.configurable?.checkpoint_id;

    if (!threadId || !checkpointId) {
      throw new Error("Missing thread_id or checkpoint_id in config.");
    }

    // Redis key pattern for writes: checkpoint:{threadId}:{checkpointId}:writes:{taskId}
    const key = `checkpoint:${threadId}:${checkpointId}:writes:${taskId}`;

    // We’ll store writes as JSON strings in a Redis List
    const serializedWrites = writes.map((w) => JSON.stringify(w));

    try {
      if (serializedWrites.length > 0) {
        await this.redis.rpush(key, ...serializedWrites);
      }
    } catch (err) {
      console.error("Error writing intermediate writes to Redis:", err);
      throw err;
    }
  }
}
