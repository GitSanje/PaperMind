// "use client"

// import React from "react"

// import { useState, useEffect, useRef } from "react"
// import { Document, Page, pdfjs } from "react-pdf"
// import { Spinner } from "@/components/ui/spinner"

// // Initialize pdfjs worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

// interface PDFViewerProps {
//   file: File
//   currentPage: number
//   setCurrentPage: (page: number) => void
//   setTotalPages: (pages: number) => void
//   scale: number
//   activeHighlightColor: string
//   onTextSelection: (text: string, position: { x: number; y: number }) => void
// }

// interface Highlight {
//   id: string
//   pageNumber: number
//   position: { x: number; y: number; width: number; height: number }
//   color: string
//   text?: string
// }

// export default function PDFViewer({
//   file,
//   currentPage,
//   setCurrentPage,
//   setTotalPages,
//   scale,
//   activeHighlightColor,
//   onTextSelection,
// }: PDFViewerProps) {
//   const [highlights, setHighlights] = useState<Highlight[]>([])
//   const [numPages, setNumPages] = useState<number>(0)
//   const [pageRefs, setPageRefs] = useState<{ [key: number]: React.RefObject<HTMLDivElement> }>({})
//   const [canvasRefs, setCanvasRefs] = useState<{ [key: number]: React.RefObject<HTMLCanvasElement> }>({})
//   const [isSelecting, setIsSelecting] = useState(false)
//   const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0, pageNumber: 1 })
//   const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0, pageNumber: 1 })
//   const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null)
//   const [selectedText, setSelectedText] = useState("")
//   const containerRef = useRef<HTMLDivElement>(null)
//   const observerRef = useRef<IntersectionObserver | null>(null)

//   // Set up page refs when document loads
//   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
//     setNumPages(numPages)
//     setTotalPages(numPages)

//     // Create refs for each page and canvas
//     const newPageRefs: { [key: number]: React.RefObject<HTMLDivElement> } = {}
//     const newCanvasRefs: { [key: number]: React.RefObject<HTMLCanvasElement> } = {}

//     for (let i = 1; i <= numPages; i++) {
//       newPageRefs[i] = React.createRef<HTMLDivElement>()
//       newCanvasRefs[i] = React.createRef<HTMLCanvasElement>()
//     }

//     setPageRefs(newPageRefs)
//     setCanvasRefs(newCanvasRefs)
//   }

//   // Set up intersection observer to detect which page is currently visible
//   useEffect(() => {
//     if (numPages > 0 && Object.keys(pageRefs).length > 0) {
//       observerRef.current = new IntersectionObserver(
//         (entries) => {
//           entries.forEach((entry) => {
//             if (entry.isIntersecting) {
//               const pageNumber = Number.parseInt(entry.target.getAttribute("data-page-number") || "1", 10)
//               setCurrentPage(pageNumber)
//             }
//           })
//         },
//         { threshold: 0.5 },
//       )

//       // Observe all page refs
//       Object.entries(pageRefs).forEach(([pageNumber, ref]) => {
//         if (ref.current) {
//           observerRef.current?.observe(ref.current)
//         }
//       })

//       return () => {
//         observerRef.current?.disconnect()
//       }
//     }
//   }, [numPages, pageRefs, setCurrentPage])

//   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
//     if (!pageRefs[pageNumber]?.current) return

//     // Check if we clicked on an existing highlight
//     const clickedHighlight = findHighlightAtPosition(e, pageNumber)

//     if (clickedHighlight) {
//       // If we clicked on a highlight, select it
//       setSelectedHighlight(clickedHighlight.id)
//       e.preventDefault()
//       return
//     }

//     // Otherwise start a new selection
//     setSelectedHighlight(null)
//     const rect = pageRefs[pageNumber].current!.getBoundingClientRect()
//     setIsSelecting(true)
//     setSelectionStart({
//       x: (e.clientX - rect.left) / scale,
//       y: (e.clientY - rect.top) / scale,
//       pageNumber,
//     })
//     setSelectionEnd({
//       x: (e.clientX - rect.left) / scale,
//       y: (e.clientY - rect.top) / scale,
//       pageNumber,
//     })
//   }

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
//     if (!isSelecting || !pageRefs[pageNumber]?.current || selectionStart.pageNumber !== pageNumber) return

//     const rect = pageRefs[pageNumber].current!.getBoundingClientRect()
//     setSelectionEnd({
//       x: (e.clientX - rect.left) / scale,
//       y: (e.clientY - rect.top) / scale,
//       pageNumber,
//     })
//   }

//   const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!isSelecting) return

//     // Only create highlight if selection is on the same page
//     if (selectionStart.pageNumber === selectionEnd.pageNumber) {
//       // Create highlight if selection is large enough
//       const width = Math.abs(selectionEnd.x - selectionStart.x)
//       const height = Math.abs(selectionEnd.y - selectionStart.y)

//       if (width > 10 && height > 5) {
//         // Get selected text
//         const selection = window.getSelection()
//         const text = selection?.toString() || ""
//         setSelectedText(text)

//         const newHighlight: Highlight = {
//           id: Date.now().toString(),
//           pageNumber: selectionStart.pageNumber,
//           position: {
//             x: Math.min(selectionStart.x, selectionEnd.x),
//             y: Math.min(selectionStart.y, selectionEnd.y),
//             width,
//             height,
//           },
//           color: activeHighlightColor,
//           text,
//         }

//         setHighlights([...highlights, newHighlight])

//         // Show selection menu
//         if (text) {
//           onTextSelection(text, {
//             x: e.clientX,
//             y: e.clientY,
//           })
//         }
//       }
//     }

//     setIsSelecting(false)
//   }

//   const findHighlightAtPosition = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
//     if (!pageRefs[pageNumber]?.current) return null

//     const rect = pageRefs[pageNumber].current!.getBoundingClientRect()
//     const x = (e.clientX - rect.left) / scale
//     const y = (e.clientY - rect.top) / scale

//     return highlights.find((highlight) => {
//       if (highlight.pageNumber !== pageNumber) return false

//       const { position } = highlight
//       return x >= position.x && x <= position.x + position.width && y >= position.y && y <= position.y + position.height
//     })
//   }

//   const handleDeleteHighlight = (id: string) => {
//     setHighlights(highlights.filter((highlight) => highlight.id !== id))
//     setSelectedHighlight(null)
//   }

//   const handleChangeHighlightColor = (id: string, color: string) => {
//     setHighlights(
//       highlights.map((highlight) => {
//         if (highlight.id === id) {
//           return { ...highlight, color }
//         }
//         return highlight
//       }),
//     )
//   }

//   // Render highlights on canvas for each page
//   useEffect(() => {
//     Object.entries(canvasRefs).forEach(([pageNumberStr, canvasRef]) => {
//       const pageNumber = Number.parseInt(pageNumberStr, 10)
//       const canvas = canvasRef.current
//       const pageContainer = pageRefs[pageNumber]?.current

//       if (!canvas || !pageContainer) return

//       // Update canvas dimensions to match the page container
//       canvas.width = pageContainer.clientWidth
//       canvas.height = pageContainer.clientHeight

//       const ctx = canvas.getContext("2d")
//       if (!ctx) return

//       // Clear previous highlights
//       ctx.clearRect(0, 0, canvas.width, canvas.height)

//       // Draw current selection if selecting on this page
//       if (isSelecting && selectionStart.pageNumber === pageNumber && selectionEnd.pageNumber === pageNumber) {
//         const x = Math.min(selectionStart.x, selectionEnd.x)
//         const y = Math.min(selectionStart.y, selectionEnd.y)
//         const width = Math.abs(selectionEnd.x - selectionStart.x)
//         const height = Math.abs(selectionEnd.y - selectionStart.y)

//         ctx.fillStyle = `${activeHighlightColor}80` // 50% opacity
//         ctx.fillRect(x * scale, y * scale, width * scale, height * scale)
//       }

//       // Draw saved highlights for this page
//       highlights
//         .filter((h) => h.pageNumber === pageNumber)
//         .forEach((highlight) => {
//           const { x, y, width, height } = highlight.position

//           // Draw highlight with different style if selected
//           if (highlight.id === selectedHighlight) {
//             // Draw selected highlight with border
//             ctx.fillStyle = `${highlight.color}A0` // 60% opacity
//             ctx.fillRect(x * scale, y * scale, width * scale, height * scale)
//             ctx.strokeStyle = "#000000"
//             ctx.lineWidth = 2
//             ctx.strokeRect(x * scale, y * scale, width * scale, height * scale)

//             // Draw delete button
//             const btnX = (x + width) * scale - 24
//             const btnY = y * scale

//             // Draw delete button background
//             ctx.fillStyle = "#FFFFFF"
//             ctx.fillRect(btnX - 4, btnY - 4, 28, 28)
//             ctx.strokeStyle = "#000000"
//             ctx.lineWidth = 1
//             ctx.strokeRect(btnX - 4, btnY - 4, 28, 28)

//             // Draw X for delete button (simplified)
//             ctx.beginPath()
//             ctx.moveTo(btnX + 4, btnY + 4)
//             ctx.lineTo(btnX + 16, btnY + 16)
//             ctx.moveTo(btnX + 16, btnY + 4)
//             ctx.lineTo(btnX + 4, btnY + 16)
//             ctx.strokeStyle = "#FF0000"
//             ctx.lineWidth = 2
//             ctx.stroke()

//             // Draw color button
//             const colorBtnX = btnX - 30
//             const colorBtnY = btnY

//             // Draw color button background
//             ctx.fillStyle = "#FFFFFF"
//             ctx.fillRect(colorBtnX - 4, colorBtnY - 4, 28, 28)
//             ctx.strokeStyle = "#000000"
//             ctx.lineWidth = 1
//             ctx.strokeRect(colorBtnX - 4, colorBtnY - 4, 28, 28)

//             // Draw color palette icon (simplified)
//             ctx.fillStyle = highlight.color
//             ctx.fillRect(colorBtnX + 4, colorBtnY + 4, 16, 16)
//           } else {
//             ctx.fillStyle = `${highlight.color}80` // 50% opacity
//             ctx.fillRect(x * scale, y * scale, width * scale, height * scale)
//           }
//         })
//     })
//   }, [
//     highlights,
//     isSelecting,
//     selectionStart,
//     selectionEnd,
//     scale,
//     activeHighlightColor,
//     pageRefs,
//     canvasRefs,
//     selectedHighlight,
//   ])

//   // Handle canvas click for highlight controls
//   const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
//     if (!selectedHighlight) return

//     const highlight = highlights.find((h) => h.id === selectedHighlight && h.pageNumber === pageNumber)
//     if (!highlight) return

//     const rect = pageRefs[pageNumber].current!.getBoundingClientRect()
//     const x = (e.clientX - rect.left) / scale
//     const y = (e.clientY - rect.top) / scale

//     const { position } = highlight
//     const btnX = position.x + position.width - 24 / scale
//     const btnY = position.y

//     // Check if delete button was clicked
//     if (x >= btnX && x <= btnX + 20 / scale && y >= btnY && y <= btnY + 20 / scale) {
//       handleDeleteHighlight(selectedHighlight)
//       e.stopPropagation()
//       return
//     }

//     // Check if color button was clicked
//     const colorBtnX = btnX - 30 / scale
//     const colorBtnY = btnY

//     if (x >= colorBtnX && x <= colorBtnX + 20 / scale && y >= colorBtnY && y <= colorBtnY + 20 / scale) {
//       // Show color picker
//       const colors = ["#FFEB3B", "#4CAF50", "#2196F3", "#F44336", "#9C27B0"]
//       const randomColor = colors[Math.floor(Math.random() * colors.length)]
//       handleChangeHighlightColor(selectedHighlight, randomColor)
//       e.stopPropagation()
//       return
//     }
//   }

//   // Add resize observer to handle container size changes
//   useEffect(() => {
//     const resizeObserver = new ResizeObserver(() => {
//       // Redraw all canvases when container resizes
//       Object.entries(canvasRefs).forEach(([pageNumberStr, canvasRef]) => {
//         const pageNumber = Number.parseInt(pageNumberStr, 10)
//         const canvas = canvasRef.current
//         const pageContainer = pageRefs[pageNumber]?.current

//         if (!canvas || !pageContainer) return

//         canvas.width = pageContainer.clientWidth
//         canvas.height = pageContainer.clientHeight
//       })
//     })

//     if (containerRef.current) {
//       resizeObserver.observe(containerRef.current)
//     }

//     return () => {
//       resizeObserver.disconnect()
//     }
//   }, [canvasRefs, pageRefs])

//   return (
//     <div className="relative" ref={containerRef}>
//       <Document
//         file={file}
//         onLoadSuccess={onDocumentLoadSuccess}
//         loading={
//           <div className="flex justify-center p-10">
//             <Spinner />
//           </div>
//         }
//         error={<div className="text-center p-10 text-red-500">Failed to load PDF</div>}
//       >
//         {Array.from(new Array(numPages), (_, index) => {
//           const pageNumber = index + 1
//           return (
//             <div
//               key={`page_${pageNumber}`}
//               ref={pageRefs[pageNumber]}
//               data-page-number={pageNumber}
//               className="relative mb-4 last:mb-0"
//               onMouseDown={(e) => handleMouseDown(e, pageNumber)}
//               onMouseMove={(e) => handleMouseMove(e, pageNumber)}
//               onMouseUp={(e) => handleMouseUp(e)}
//               onMouseLeave={() => setIsSelecting(false)}
//               onClick={(e) => handleCanvasClick(e, pageNumber)}
//             >
//               <div className="sticky top-0 left-0 z-10 bg-white/80 backdrop-blur-sm text-xs py-1 px-2 rounded-br-md shadow-sm">
//                 Page {pageNumber} of {numPages}
//               </div>
//               <Page
//                 pageNumber={pageNumber}
//                 renderTextLayer={true}
//                 renderAnnotationLayer={false}
//                 scale={scale}
//                 loading={
//                   <div className="flex justify-center p-10">
//                     <Spinner />
//                   </div>
//                 }
//               />
//               <canvas
//                 ref={canvasRefs[pageNumber]}
//                 className="absolute top-0 left-0 pointer-events-none"
//                 width={pageRefs[pageNumber]?.current?.clientWidth || 0}
//                 height={pageRefs[pageNumber]?.current?.clientHeight || 0}
//               />
//             </div>
//           )
//         })}
//       </Document>
//     </div>
//   )
// }
