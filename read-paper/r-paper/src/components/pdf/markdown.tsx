import React from "react";
import ReactMarkdown from "react-markdown";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Latext from 'react-latex-next'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
export const mixedText3 = `
This paper introduces the Neural Tangent Kernel (NTK) to analyze the training dynamics of Artificial Neural Networks (ANNs) with infinite width, focusing on the asymptotics of neural networks at initialization and during training [2, 358, 359, 185].

**Key Findings and Contributions:**

- **Equivalence to Kernel Methods**: In the infinite-width limit, ANNs at initialization are equivalent to Gaussian processes, linking them to kernel methods [0, 23, 90, 91, 367]. During training with gradient descent, the network function \( f_\theta \) follows the kernel gradient of the functional cost with respect to the NTK [1, 28, 84].
- **Constant NTK**: The NTK converges to a limiting kernel that remains constant during training in the infinite-width limit [4, 88, 394, 395]. This allows ANN training to be studied in function space rather than parameter space [5].
- **Convergence and Positive-Definiteness**: Training convergence is related to the positive-definiteness of the limiting NTK [6, 7, 30, 113]. The paper proves this positive-definiteness when data is supported on a sphere and the non-linearity is non-polynomial [118, 461].
- **Linear Differential Equation**: For least-squares regression, the network function \( f_\theta \) follows a linear differential equation in the infinite-width limit [8, 32]. Convergence is fastest along the largest kernel principal components, theoretically motivating early stopping [9, 33, 130, 131, 132].

**Mathematical Formulation and Proofs:**

- **Kernel Gradient Descent**: A time-dependent function \( f(t) \) follows kernel gradient descent with respect to a kernel \( K \) if it satisfies \( \partial_t f(t) = -\nabla_K C|_{f(t)} \) [70]. Convergence to a critical point of the cost \( C \) is guaranteed if \( K \) is positive definite [72].
- **Neural Tangent Kernel (NTK)**: For ANNs trained with gradient descent, the network function \( f_\theta \) evolves along the kernel gradient \( \partial_t f_\theta(t) = -\nabla_{\Theta^{(L)}} C|_{f_\theta(t)} \) with respect to the NTK \( \Theta^{(L)}(\theta) = \sum_{p=1}^P \partial_{\theta_p} F^{(L)}(\theta) \otimes \partial_{\theta_p} F^{(L)}(\theta) \) [84].
- **Limiting NTK**: The NTK \( \Theta^{(L)} \) converges in probability to a deterministic limiting kernel \( \Theta^{(L)}_\infty \otimes \text{Id}_{n_L} \) [97, 380]:
  - \( \Theta^{(1)}_\infty (x, x') = \Sigma^{(1)}(x, x') \)
  - \( \Theta^{(L+1)}_\infty (x, x') = \Theta^{(L)}_\infty (x, x') \dot{\Sigma}^{(L+1)}(x, x') + \Sigma^{(L+1)}(x, x') \), where \( \dot{\Sigma}^{(L+1)}(x, x') = E_{f \sim N(0, \Sigma^{(L)})} [\dot{\sigma}(f(x)) \dot{\sigma}(f(x'))] \)
- **Positive Definiteness of NTK**: For a non-polynomial Lipschitz nonlinearity \( \sigma \), the restriction of the limiting NTK \( \Theta_{\infty}^{(L)} \) to the unit sphere \( S^{n_0 - 1} = \{ x \in \mathbb{R}^{n_0} : x^T x = 1 \} \) is positive definite if \( L \geq 0 \) [118].
- **Weight Convergence**: The variation of weights \( W^{(\ell)} \) converges in probability to zero as the layer size \( n_\ell \) approaches infinity [439].

**Experimental Results:**

- Numerical experiments demonstrate that the behavior of wide ANNs closely approximates the theoretical infinite-width limit on artificial and MNIST datasets [10, 34, 35, 148, 158].
- Wider networks exhibit less variance and smoother NTK functions [154].
- The NTK provides a good indication of the distribution of \( f_{\theta}(t) \) as \( t \rightarrow \infty \), even for relatively small widths [162, 163].
- Trajectories along the 2nd principal component converge to the theoretical limit as width increases [179].

In summary, this paper provides a theoretical framework using the Neural Tangent Kernel to understand and predict the behavior of infinitely wide neural networks during training, supported by empirical evidence from numerical experiments [186, 187, 189].

`
;
const mixedText2=`
This paper uses the Neural Tangent Kernel (NTK) to analyze Artificial Neural Networks (ANNs) during training [2, 25].

**Key Findings:**

*   **Equivalence to Kernel Methods**: In the infinite-width limit, ANNs are equivalent to Gaussian processes at initialization, linking them to kernel methods [0, 23]. During training with gradient descent, the network function \( f_\theta \) follows the kernel gradient of the functional cost with respect to the NTK [1, 2].
*   **Convergence and Positive-Definiteness**: The NTK converges to a constant, explicit limiting kernel in the infinite-width limit, enabling the study of ANN training in function space [4, 5]. Convergence relates to the positive-definiteness of this limiting NTK, proven for data on a sphere with non-polynomial nonlinearity [6, 7].
*   **Linear Differential Equation**: For least-squares regression in the infinite-width limit, the network function \\( f_\theta \\) follows a linear differential equation [8]. Convergence is fastest along the largest kernel principal components, providing a basis for early stopping [9, 32].
*   **Numerical Validation**: Experiments confirm that wide ANNs behave close to the theoretical limit [10, 34, 35].

The study focuses on fully-connected ANNs with specific initialization and nonlinearity conditions [36, 39]. Training optimizes \( f_\theta \) in function space \( \mathcal{F} \) with respect to a functional cost \( \mathcal{C} \), where the NTK facilitates studying training in \( \mathcal{F} \) when \( \mathcal{C} \) is convex [53, 56].

**Kernel Gradient Descent**

A time-dependent function $f(t)$ follows the kernel gradient descent with respect to $K$ if it satisfies $\partial_t f(t) = -\nabla_K C|_{f(t)}$ [70]. During this descent, the cost $C(f(t))$ evolves as [71]:
        $$
        \partial_t C|_{f(t)} = - \langle d|_{f(t)}, \nabla_K C|_{f(t)} \rangle_{p \text{ in}} = - \|d|_{f(t)}\|_K^2.
        $$
Convergence to a critical point of $C$ is guaranteed if $K$ is positive definite with respect to $\|\cdot\|_{p \text{ in}}$ [72]. If the cost is convex and bounded from below, $f(t)$ converges to a global minimum as $t \rightarrow \infty$ [73].

**Neural Tangent Kernel (NTK) and Gradient Descent**

For ANNs trained with gradient descent, the network function $f_\theta$ evolves along the kernel gradient $\partial_t f_\theta(t) = -\nabla_{\Theta^{(L)}} C|_{f_\theta(t)}$ with respect to the NTK $\Theta^{(L)}(\theta)$ [84]. In the infinite-width limit, the NTK becomes deterministic at initialization and remains constant during training [88].

**Infinite-Width Limit and Gaussian Processes**

In the infinite-width limit, output functions \( f_{\theta, k} \) tend to iid Gaussian processes with covariance \( \Sigma^{(L)} \) [90, 91]:
       
        \\begin{aligned}
             \\Sigma^{(1)}(x, x') &= \\frac{1}{n_0} x^T x' + \\beta^2 \\\\
             \\Sigma^{(L+1)}(x, x') &= \\mathbb{E}_{f \\sim \\mathcal{N}(0, \\Sigma^{(L)})} [\\sigma(f(x)) \\sigma(f(x'))] + \\beta^2,
        \\end{aligned}
      
The NTK \( \Theta^{(L)} \) converges to a deterministic limiting kernel [97, 98]:
        $$
        \begin{aligned}
             \Theta_\infty^{(1)}(x, x') &= \Sigma^{(1)}(x, x') \\
             \Theta_\infty^{(L+1)}(x, x') &= \Theta_\infty^{(L)}(x, x') \dot{\Sigma}^{(L+1)}(x, x') + \Sigma^{(L+1)}(x, x'),
        \end{aligned}
        $$

**Constant NTK During Training**

The NTK remains asymptotically constant during training, and the dynamics of \( f_\theta \) are described by a differential equation [102, 110]:
        $$
        \partial_t f_\theta(t) = \Phi_{\Theta_\infty^{(L)} \otimes \text{Id}_{n_L}} (\langle d_t, \cdot \rangle_{p \text{ in}}).
        $$

**Positive Definiteness and Least-Squares Regression**

The limiting NTK is positive definite if the span of the derivatives becomes dense as the width approaches infinity [114, 115]. For non-polynomial Lipschitz nonlinearity \( \sigma \), the restriction of the limiting NTK \( \Theta_{\infty}^{(L)} \) to the unit sphere is positive definite if \( L \geq 0 \) [118].

For least-squares regression, the solution to the differential equation involves a map \( \Pi \) [119, 123]:
$$f_t = f^* + e^{-t\Pi}(f_0 - f^*)$$

**Early Stopping**

Decomposing the difference \( (f^* - f_0) \) along the eigenspaces of \( \Pi \), the trajectory of the function \( f_t \) is [129]:
$$f_t = f^* + \Delta_0 f + \sum_{i=1}^{Nn_L} e^{-t\lambda_i} \Delta_i f$$
This motivates early stopping, as convergence is faster along eigenspaces with larger eigenvalues \( \lambda_i \) [130, 131].

**Numerical Experiments and Validation**

Numerical experiments compare ANNs of various widths to the theoretical infinite-width limit [138, 139]. The NTK helps understand the generalization properties of ANNs and the influence of depth and nonlinearity [186, 188]. Analyzing training with NTK relates ANN convergence to the positive-definiteness of the limiting NTK and characterizes directions favored by early stopping [189].

**Asymptotics at Initialization**

In the infinite-width limit, output functions \( f_{\theta, i} \) tend to independent and identically distributed (iid) Gaussian processes [367, 368]:

*   \( \Sigma^{(1)}(x, x') = \frac{1}{n_0}x^T x' + \beta^2 \)
*   \( \Sigma^{(L+1)}(x, x') = \mathbb{E}_f[\sigma(f(x))\sigma(f(x'))] + \beta^2 \), where the expectation is with respect to a centered Gaussian process \( f \) with covariance \( \Sigma^{(L)} \).

The NTK \( \Theta^{(L)} \) converges in probability to a deterministic limiting kernel [379, 380]:

*   \( \Theta_\infty^{(1)}(x, x') = \Sigma^{(1)}(x, x') \)
*   \( \Theta_\infty^{(L+1)}(x, x') = \dot{\Sigma}^{(L+1)}(x, x')\Theta_\infty^{(L)}(x, x') + \Sigma^{(L+1)}(x, x') \),

**Asymptotics during Training**

In the infinite-width limit, the NTK remains constant during training [394, 396]. Consequently, the dynamics of \( f_\theta \) are described by a differential equation [397]:
$\partial_t f_\theta(t) = \Phi_{\Theta^{(L)}_\infty \otimes Id_{n_L}}(\langle d_t, \cdot \rangle_{p_{in}})$

**Positive-Definiteness of \( \Theta_{\infty}^{(L)} \)**

For a non-polynomial Lipschitz nonlinearity \( \sigma \), the restriction of the limiting NTK \( \Theta_{\infty}^{(L)} \) to the unit sphere is positive-definite if \( L \geq 2 \) [461, 462].

`
const mixedText1 = `
In the infinite-width limit, Artificial Neural Networks (ANNs) are equivalent to Gaussian processes, connecting them to kernel methods [0, 22]. During gradient descent, the network function \( f_\theta \) follows the kernel gradient with respect to the Neural Tangent Kernel (NTK), which is central to describing the generalization features of ANNs [1, 2]. The dynamics of \( f_\theta \) follows kernel gradient descent in function space with respect to a limiting kernel, dependent on network depth, nonlinearity, and initialization variance [27]. Convergence properties of ANNs during training can be related to the positive-definiteness of the infinite-width limit NTK, which can be proven when the dataset is supported on a sphere [28, 29]. For a least-squares regression loss, the network function \( f_\theta \) follows a linear differential equation in the infinite-width limit, where eigenfunctions of the Jacobian are kernel principal components of the input data, motivating early stopping to reduce overfitting [31, 32]. Numerical investigations validate these theoretical results for artificial and MNIST datasets, showing that wide ANNs behave close to the theoretical limit [33, 34].

A time-dependent function \\( f(t) \\) follows kernel gradient descent with respect to \( K \) if it satisfies \( \partial_t f(t) = -\nabla_K C|_{f(t)} \) [64]. During this descent, the cost \( C(f(t)) \) evolves as \( \partial_t C|_{f(t)} = - \langle d|_{f(t)}, \nabla_K C|_{f(t)} \rangle_{p \text{ in}} = - \| d|_{f(t)} \|_K^2 \) [65]. Convergence to a critical point of \( C \) is guaranteed if \( K \) is positive definite with respect to \( \| \cdot \|_{p \text{ in}} \) [66].

For ANNs trained with gradient descent, the network function \( f_\theta \) evolves along the negative kernel gradient \( \partial_t f_\theta(t) = -\nabla_{\Theta^{(L)}} C|_{f_\theta(t)} \) with respect to the neural tangent kernel (NTK) \( \Theta^{(L)}(\theta) = \sum_{p=1}^P \partial_{\theta_p} F^{(L)}(\theta) \otimes \partial_{\theta_p} F^{(L)}(\theta) \) [76]. In the infinite-width limit, the NTK becomes deterministic at initialization and stays constant during training [80].

At initialization, output functions \( f_{\theta, i} \) tend to i.i.d. Gaussian processes in the infinite-width limit [82]. For a network of depth \( L \) with a Lipschitz nonlinearity \( \sigma \), as \( n_1, \dots, n_{L-1} \rightarrow \infty \), the functions \( f_{\theta, k} \) tend to i.i.d. centered Gaussian processes of covariance \( \Sigma^{(L)} \), defined recursively [82]:
*   \( \Sigma^{(1)}(x, x') = \frac{1}{n_0} x^T x' + \beta^2 \)
*   \( \Sigma^{(L+1)}(x, x') = \mathbb{E}_{f \sim \mathcal{N}(0, \Sigma^{(L)})} [\sigma(f(x)) \sigma(f(x'))] + \beta^2 \)

In the same limit, the NTK converges in probability to a deterministic limiting kernel [85]. For a network of depth \( L \) at initialization, with a Lipschitz nonlinearity \( \sigma \), as \( n_1, \dots, n_{L-1} \rightarrow \infty \), the NTK \( \Theta^{(L)} \) converges in probability to \( \Theta^{(L)}_\infty \otimes \text{Id}_{n_L} \) [86]. The scalar kernel \( \Theta^{(L)}_\infty: \mathbb{R}^{n_0} \times \mathbb{R}^{n_0} \rightarrow \mathbb{R} \) is defined recursively by [86]:
*   \( \Theta^{(1)}_\infty(x, x') = \Sigma^{(1)}(x, x') \)
*   \( \Theta^{(L+1)}_\infty(x, x') = \Theta^{(L)}_\infty(x, x') \dot{\Sigma}^{(L+1)}(x, x') + \Sigma^{(L+1)}(x, x') \),

where \( \dot{\Sigma}^{(L+1)}(x, x') = \mathbb{E}_{f \sim \mathcal{N}(0, \Sigma^{(L)})} [\dot{\sigma}(f(x)) \dot{\sigma}(f(x'))] \) [87].

The NTK stays asymptotically constant during training [90]. For parameters updated according to \( \partial_t \theta_p(t) = \langle \partial_{\theta_p} F^{(L)}(\theta(t)), d_t \rangle_{p \text{ in}} \), where \( d_t \in F \) is a training direction [91], and for any \( T \) such that \( \int_0^T \|d_t\|_{p \text{ in}} dt \) stays stochastically bounded as \( n_1, \dots, n_{L-1} \rightarrow \infty \), then uniformly for \( t \in [0, T] \), \( \Theta^{(L)}(t) \rightarrow \Theta^{(L)}_\infty \otimes \text{Id}_{n_L} \) [94]. Consequently, the dynamics of \( f_\theta \) is described by \( \partial_t f_\theta(t) = \Phi_{\Theta^{(L)}_\infty \otimes \text{Id}_{n_L}} (\langle d_t, \cdot \rangle_{p \text{ in}}) \) [95].

The limiting Neural Tangent Kernel (NTK) is positive definite if the span of the derivatives \( \partial_\theta p F(L) \) becomes dense in \( F \) with respect to the \( p \)-norm as the width approaches infinity [99, 100]. For data on a sphere, the positive-definiteness of the limiting NTK can be proven using Gaussian integration techniques [103].

The least-squares regression cost is defined as \( C(f) = \frac{1}{2} ||f - f^*||^2_{p_{in}} = \frac{1}{2} \mathbb{E}_{x \sim p_{in}} [||f(x) - f^*(x)||^2] \), where \( f^* \) is the goal function and \( p_{in} \) is the input distribution [103].

The behavior of a function \( f_t \) during kernel gradient descent with kernel \( K \) is of interest, especially when \( K = \Theta_\infty^{(L)} \otimes Id_{n_L} \) [106]: \( \partial_t f_t = \Phi_K(\langle f^* - f, \cdot \rangle_{p_{in}}) \). The solution to this differential equation is \( f_t = f^* + e^{-t\Pi} (f_0 - f^*) \), where \( \Pi: f \mapsto \Phi_K(\langle f, \cdot \rangle_{p_{in}}) \) and \( e^{-t\Pi} = \sum_{k=0}^{\infty} \frac{(-t)^k}{k!} \Pi^k \) [107, 108].

For a finite dataset \( x_1, \dots, x_N \), the map \( \Pi \) takes the form \( \Pi(f)_k(x) = \frac{1}{N} \sum_{i=1}^N \sum_{k'=1}^{n_L} f_{k'}(x_i) K_{kk'}(x_i, x) \) [110]. \( \Pi \) has at most \( Nn_L \) positive eigenfunctions, which are the kernel principal components of the data with respect to the kernel \( K \), and the corresponding eigenvalues \( \lambda_i \) represent the variance captured by each component [111, 112].

Decomposing the difference \( (f^* - f_0) = \Delta_0 f + \Delta_1 f + \dots + \Delta_{Nn_L} f \) along the eigenspaces of \( \Pi \), the trajectory of the function \( f_t \) is \( f_t = f^* + \Delta_0 f + \sum_{i=1}^{Nn_L} e^{-t\lambda_i} \Delta_i f \), where \( \Delta_0 f \) is in the kernel (null-space) of \( \Pi \) and \( \Delta_i f \propto f^{(i)} \). This decomposition motivates the use of early stopping, as convergence is faster along eigenspaces with larger eigenvalues \( \lambda_i \) [114, 115].

If \( f_0 \) is initialized with a Gaussian distribution, then \( f_t \) is Gaussian for all times \( t \) [117]. Assuming the kernel is positive definite on the data, as \( t \rightarrow \infty \), \( f_\infty = f^* + \Delta_0 f = f_0 - \sum_i \Delta_i f \) takes the form \( f_{\infty, k}(x) = \kappa_{x,k}^T \tilde{K}^{-1} y^* + (f_0(x) - \kappa_{x,k}^T \tilde{K}^{-1} y_0) \), where \( \kappa_{x,k} = (K_{kk'}(x, x_i))_{i,k'} \), \( y^* = (f^*_k(x_i))_{i,k} \), and \( y_0 = (f_{0,k}(x_i))_{i,k} \) are \( Nn_L \)-vectors [118, 119, 120, 121].

Fully connected ANNs of various widths are compared to the theoretical infinite-width limit, using the ReLU nonlinearity \( \sigma(x) = \max(0, x) \) [122, 123]. The convergence of the NTK \( \Theta^{(L)} \) of a network of depth \( L = 4 \) is illustrated for widths \( n = 500, 10000 \) [130]. For a regression cost, the infinite-width limit network function \( f_\theta(t) \) has a Gaussian distribution for all times \( t \) [137].

The paper introduces the Neural Tangent Kernel (NTK) as a tool to study Artificial Neural Networks (ANNs) during gradient descent [160]. In the infinite-width limit, ANN gradient descent becomes equivalent to kernel gradient descent with respect to the NTK, denoted as \( \Theta_{\infty}^{(L)} \), which depends on depth, nonlinearity, and parameter initialization variance [161, 162]. The NTK helps understand the generalization properties of ANNs and the influence of depth and nonlinearity on learning [163].

In the infinite-width limit, the output functions \( f_{\theta,i} \) tend to independent and identically distributed (iid) Gaussian processes [211]. For a network of depth \( L \) at initialization, with a Lipschitz nonlinearity \( \sigma \), as \( n_1, \dots, n_{L-1} \rightarrow \infty \) sequentially, the output functions \( f_{\theta,k} \) tend in law to iid centered Gaussian processes with covariance \( \Sigma^{(L)} \) [212], defined recursively as:
*   \( \Sigma^{(1)}(x, x') = \frac{1}{n_0}x^T x' + \beta^2 \)
*   \( \Sigma^{(L+1)}(x, x') = \mathbb{E}_f[\sigma(f(x))\sigma(f(x'))] + \beta^2 \), where the expectation is with respect to a centered Gaussian process \( f \) of covariance \( \Sigma^{(L)} \)

For a network of depth \( L \) at initialization, with a Lipschitz nonlinearity \( \sigma \), and as \( n_1, \dots, n_{L-1} \rightarrow \infty \) sequentially, the NTK \( \Theta^{(L)} \) converges in probability to a deterministic limiting kernel [224]:
\( \Theta^{(L)} \rightarrow \Theta_{\infty}^{(L)} \otimes Id_{n_L} \), where the scalar kernel \( \Theta_{\infty}^{(L)}: \mathbb{R}^{n_0} \times \mathbb{R}^{n_0} \rightarrow \mathbb{R} \) is defined recursively by [225]:
*   \( \Theta_{\infty}^{(1)}(x, x') = \Sigma^{(1)}(x, x') \)
*   \( \Theta_{\infty}^{(L+1)}(x, x') = \Theta_{\infty}^{(L)}(x, x')\dot{\Sigma}^{(L+1)}(x, x') + \Sigma^{(L+1)}(x, x') \),

with \( \dot{\Sigma}^{(L+1)}(x, x') = \mathbb{E}_{f \sim \mathcal{N}(0, \Sigma^{(L)})} [\dot{\sigma}(f(x))\dot{\sigma}(f(x'))] \), where \( \dot{\sigma} \) is the derivative of \( \sigma \).

Assuming \( \sigma \) is a Lipschitz, twice differentiable nonlinearity with a bounded second derivative, for any \( T \) such that \( \int_0^T \|d_t\|_{p_{in}} dt \) stays stochastically bounded, as \( n_1, \dots, n_{L-1} \rightarrow \infty \) sequentially, we have uniformly for \( t \in [0, T] \) [239]:
\( \Theta^{(L)}(t) \rightarrow \Theta_{\infty}^{(L)} \otimes Id_{n_L} \). As a result, the dynamics of \( f_\theta \) are described by the differential equation [240]:
\( \partial_t f_\theta(t) = \Phi_{\Theta_{\infty}^{(L)} \otimes Id_{n_L}}(\langle d_t, \cdot \rangle_{p_{in}}) \).

The evolution of pre-activations and weights is defined by [282]:
*   \( \partial_t \tilde{\alpha}^{(\ell)} = \Phi_{\Theta^{(\ell)}}(<d_t^{(\ell)}, \cdot>_{p_{in}}) \)
*   \( \partial_t W^{(\ell)} = \frac{1}{\sqrt{n^\ell}} <\alpha^{(\ell)}, d_t^{(\ell+1)}>_{p_{in}} \)

where the layer-wise training directions \( d^{(1)}, \dots, d^{(L)} \) are defined recursively.

The limiting NTK \( \Theta^{(L)} \) is decomposed recursively as \( \Theta^{(L+1)} = \dot{\Sigma}^{(L)} \Theta^{(L)} + \Sigma^{(L+1)} \) [303]. If \( \Sigma^{(L+1)} \) is positive-definite, then \( \Theta^{(L+1)} \) is positive-definite [304, 305]. By definition, \( \Sigma^{(L+1)}(x, x') = E_{f \sim N(0, \Sigma^{(L)})} [\sigma(f(x)) \sigma(f(x'))] + \beta^2 \) [306].

`;

function wrapCitations(text: string) {
  return text.replace(/\[(\d+(?:,\s*\d+)*)\]/g, (_, numbersStr) => {
    const numbers = numbersStr.split(",");
    return numbers
      .map((n: any) => {
        return `<span class="inline-block mx-0.5 px-1 py-0.5 border border-indigo-700 rounded  text-xs font-medium align-middle text-white bg-indigo-700">${n.trim()}</span>`;
      })
      .join("");
  });
}

export default function MathRenderer({ text }: { text?: string }) {
  const input = text;

  // Split by:
  // - block math: \begin{...}...\end{...}
  // - inline math: \( ... \)
const parts = input?.split(
  /(\$\$[\s\S]+?\$\$|\\begin\{[\s\S]*?\}[\s\S]*?\\end\{[\s\S]*?\}|\\\([^\)]*?\\\)|\\\[[\s\S]*?\\\])/g
)?.filter(Boolean);

  return (
    <div className="prose max-w-none">
      {parts?.map((part, i) => {
       
        if (!part) return;
       if (
    part.startsWith("$$") && part.endsWith("$$") ||
    part.startsWith("\\[") && part.endsWith("\\]") ||
    part.includes("\\begin{") && part.includes("\\end{")
  ) {
          const math = part
      .replace(/^\$\$|\$\$$/g, "") // remove $$ if any
      .replace(/^\\\[|\\\]$/g, "");// remove \[ and \]  
       
          return (
            <div key={i}  className="overflow-auto whitespace-pre-wrap my-4">
              <BlockMath math={math} errorColor="#cc0000" />
            </div>
          );
        } else if (part.startsWith("\\(") && part.endsWith("\\)") ) {
          const math = part.slice(2, -2);
               
          return (
            <span key={i} className="inline-block align-middle">
              <InlineMath math={math} errorColor="#cc0000" />
            </span>
           
          );
        } else {
                    
          return (
            <div
              className="overflow-auto whitespace-pre-wrap my-4"
              style={{ wordWrap: "break-word" }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => (
                    <p {...props} style={{ wordWrap: "break-word" }} />
                  ),
                }}
              >
                {wrapCitations(part)}
              </ReactMarkdown>
            </div>
          );
        }
      })}
    </div>
  );
}
