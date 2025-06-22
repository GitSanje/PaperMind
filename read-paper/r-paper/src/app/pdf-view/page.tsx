import React from 'react'
import PDFViewerPage from '@/components/pdf/main-view'
import { auth } from '@/auth'
import { getAllHashDataFromRedis, getHighlightsByUserAndPdfId } from '@/actions/pdf'
const page = async() => {
  const session = await auth()
 const userId= session?.user.id!
 const pdfid = 'e052eb972f646747ac4554a294eb62874077e59a5f585f459e2dbd5cb2a0975d'

    const key = `highlights:${userId}:${pdfid}`;
  const highlightsRedis  = await getAllHashDataFromRedis(key)
  console.log('====================================');
  console.log(highlightsRedis,'from server');
  console.log('====================================');
  return (
    <div>
      <PDFViewerPage session= {session!} />
    </div>
  )
}

export default page
