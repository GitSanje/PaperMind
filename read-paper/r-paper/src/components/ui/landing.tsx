"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Highlighter,
  StickyNote,
  BrainCircuit,
  Sparkles,
  BookOpen,
  Search,
  Star,
  ArrowRight,
  Upload,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { Session } from "next-auth"

export default function LandingPage({ user} : {
  user : Session
}) {
  const features = [
    {
      icon: Highlighter,
      title: "Smart Highlighting",
      description:
        "Highlight text with customizable colors. Click highlights to change colors, add notes, or ask AI questions.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: StickyNote,
      title: "Interactive Notes",
      description: "Take notes on any page. Organize by page number and quickly navigate between your annotations.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: BrainCircuit,
      title: "AI Assistant",
      description: "Ask questions about your PDF content. Get explanations, summaries, and insights powered by AI.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Sparkles,
      title: "Auto Summarization",
      description: "Generate comprehensive summaries of your documents with key points and citations.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: BookOpen,
      title: "Dictionary Lookup",
      description: "Select any word for instant dictionary definitions, synonyms, and pronunciation.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Search,
      title: "Citation Finder",
      description: "Search and highlight specific citations or references throughout your document.",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  const useCases = [
    {
      title: "Academic Research",
      description: "Perfect for students and researchers analyzing papers, thesis, and academic documents.",
      icon: "📚",
    },
    {
      title: "Legal Documents",
      description: "Review contracts, legal briefs, and case studies with precision highlighting and notes.",
      icon: "⚖️",
    },
    {
      title: "Business Reports",
      description: "Analyze financial reports, business plans, and strategic documents efficiently.",
      icon: "📊",
    },
    {
      title: "Technical Manuals",
      description: "Navigate complex technical documentation with AI-powered explanations.",
      icon: "🔧",
    },
  ]

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Research Professor",
      content: "This tool has revolutionized how I review academic papers. The AI explanations are incredibly helpful.",
      rating: 5,
    },
    {
      name: "Mark Rodriguez",
      role: "Legal Analyst",
      content: "The highlighting and note-taking features are perfect for legal document review. Saves me hours.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "MBA Student",
      content: "The summarization feature is a game-changer for studying case studies and business reports.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
   

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-4 w-4 mr-1" />
            AI-Powered PDF Analysis
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform How You
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Analyze{" "}
            </span>
            PDFs
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Highlight, annotate, and understand your documents with AI-powered insights. Perfect for students,
            researchers, and professionals who work with complex PDFs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signin">
              <Button size="lg" className="gap-2">
                <Upload className="h-5 w-5" />
                Start Analyzing
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="rounded-lg overflow-hidden shadow-2xl border bg-white">
              <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
                {/* Cartoon Illustration */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Main PDF Document */}
                  <div className="bg-white rounded-lg shadow-lg p-6 w-80 h-64 relative transform rotate-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-gray-500 ml-2">research-paper.pdf</span>
                    </div>

                    {/* Document content lines with highlights */}
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-yellow-300 rounded w-3/4"></div> {/* Yellow highlight */}
                      <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-2 bg-blue-300 rounded w-2/3"></div> {/* Blue highlight */}
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                      <div className="h-2 bg-green-300 rounded w-4/5"></div> {/* Green highlight */}
                      <div className="h-2 bg-gray-200 rounded w-3/5"></div>
                    </div>

                    {/* Floating note */}
                    <div className="absolute -right-4 top-12 bg-yellow-200 p-2 rounded shadow-sm transform -rotate-12 text-xs">
                      <StickyNote className="h-3 w-3 text-yellow-600 mb-1" />
                      Important point!
                    </div>
                  </div>

                  {/* AI Assistant Chat Bubble */}
                  <div className="absolute -left-8 top-8 bg-white rounded-xl shadow-lg p-4 w-56 transform -rotate-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <BrainCircuit className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">AI Assistant</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      "This research discusses the impact of machine learning on..."
                    </p>
                    <div className="mt-2 flex gap-1">
                      <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>

                  {/* Dictionary Popup */}
                  <div className="absolute -right-12 -bottom-4 bg-white rounded-lg shadow-lg p-3 w-48 transform rotate-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-gray-700">Dictionary</span>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-gray-800">algorithm</p>
                      <p className="text-gray-600 italic">/ˈælɡərɪðəm/</p>
                      <p className="text-gray-600 mt-1">A process or set of rules...</p>
                    </div>
                  </div>

                  {/* Floating highlight colors */}
                  <div className="absolute top-4 left-8 flex gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-sm"></div>
                    <div className="w-4 h-4 bg-blue-400 rounded-full shadow-sm"></div>
                    <div className="w-4 h-4 bg-green-400 rounded-full shadow-sm"></div>
                    <div className="w-4 h-4 bg-red-400 rounded-full shadow-sm"></div>
                    <div className="w-4 h-4 bg-purple-400 rounded-full shadow-sm"></div>
                  </div>

                  {/* Search icon */}
                  <div className="absolute bottom-8 left-12 bg-white rounded-full p-2 shadow-lg">
                    <Search className="h-4 w-4 text-gray-600" />
                  </div>

                  {/* Summary icon */}
                  <div className="absolute top-12 right-4 bg-white rounded-full p-2 shadow-lg">
                    <Sparkles className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature callouts below the illustration */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="text-center">
                <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Highlighter className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Smart Highlighting</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BrainCircuit className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">AI Insights</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <StickyNote className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Smart Notes</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Auto Summary</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Deep Analysis</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to understand, annotate, and extract insights from your PDF documents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Your PDF</h3>
              <p className="text-gray-600">
                Simply drag and drop your PDF or click to browse and upload your document.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Highlighter className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Highlight & Annotate</h3>
              <p className="text-gray-600">
                Select text to highlight, add notes, or ask AI questions about specific content.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BrainCircuit className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get AI Insights</h3>
              <p className="text-gray-600">
                Receive intelligent summaries, explanations, and answers to help you understand better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perfect For Every Use Case</h2>
            <p className="text-xl text-gray-600">
              Whether you're a student, researcher, or professional, PDF Scholar adapts to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Users Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied users who trust PDF Scholar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that works best for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-center">Free</CardTitle>
                <div className="text-center">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>5 PDFs per month
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Basic highlighting
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Note-taking
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 shadow-lg scale-105">
              <CardHeader>
                <Badge className="w-fit mx-auto mb-2">Most Popular</Badge>
                <CardTitle className="text-center">Pro</CardTitle>
                <div className="text-center">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Unlimited PDFs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    AI Assistant
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Auto Summarization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Dictionary Lookup
                  </li>
                </ul>
                <Button className="w-full">Start Free Trial</Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-center">Enterprise</CardTitle>
                <div className="text-center">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Team collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Custom integrations
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your PDF Experience?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already analyzing PDFs smarter with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button size="lg" variant="secondary" className="gap-2">
                <Upload className="h-5 w-5" />
                Start Free Today
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-white border-white hover:bg-white hover:text-blue-600"
            >
              <MessageSquare className="h-5 w-5" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6" />
                <span className="text-lg font-bold">PDF Scholar</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transform how you analyze and understand PDF documents with AI-powered insights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/app" className="hover:text-white transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PDF Scholar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
