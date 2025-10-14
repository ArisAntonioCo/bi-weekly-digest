"use client"

import { useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    question: "What is a 3-Year Stock Return Forecast?",
    answer: "Our 3-year forecasts estimate a company's total return potential, including price appreciation and dividends, over the next 36 months. We blend quantitative signals with qualitative overlays from world-class investors like Bill Gurley, Brad Gerstner, Stanley Druckenmiller, Mary Meeker, and Beth Kindig to surface the most likely outcomes."
  },
  {
    question: "Why focus on 3-year return projections?",
    answer: "Three years is the horizon where noise fades and earnings power speaks. It's sufficient time for fundamental value to emerge, while remaining relevant for your current investment decisions."
  },
  {
    question: "Why Proven Expert Frameworks?",
    answer: "Conviction sharpens when perspectives collide. By layering five distinct frameworks from world-class investors, we cut through bias, surface blind spots, and reveal durable opportunities others overlook."
  },
  {
    question: "How do you calculate Base, Bear, and Bull cases?",
    answer: "We analyze multiple scenarios using proprietary algorithms that consider market conditions, company fundamentals, industry trends, and macroeconomic factors. The Base case represents the most likely outcome, the Bull case shows optimistic potential, and the Bear case presents conservative estimates to help you understand the full range of possibilities."
  },
  {
    question: "What data sources power your AI predictions?",
    answer: "Our AI models are trained on comprehensive financial data including SEC filings, earnings reports, market data, industry research, and real-time news analysis. We leverage cutting-edge open and closed language models which we combine with our proprietary investment frameworks to deliver institutional-grade insights."
  },
  {
    question: "How often are the investment newsletters sent?",
    answer: "We deliver comprehensive investment analysis newsletters on a weekly basis, strategically timed to capture key market movements. Each newsletter includes updated stock return forecasts, market insights, and actionable investment opportunities tailored to your portfolio preferences."
  },
  {
    question: "What makes your equity frameworks 'world-class'?",
    answer: "Our platform allows you to combine battle-tested investment frameworks with various time horizons, which collectively help orient your investment goals. Each framework represents proven methodologies from legendary investors, providing diverse perspectives that enhance decision-making clarity."
  },
  {
    question: "Can I customize my investment preferences?",
    answer: "Yes, our platform allows you to set your risk tolerance, investment sectors of interest, and portfolio goals. Our AI then tailors the analysis and recommendations specifically to match your investment profile and objectives."
  },
  {
    question: "How accurate are your stock return forecasts historically?",
    answer: "As with all capital market investments, past performance does not guarantee future returns, and we encourage independent due diligence. Our projections have demonstrated strong correlation with actual market outcomes, with Base case scenarios achieving approximately 78% directional accuracy over the past 24 months. We maintain full transparency through regular performance tracking and published accuracy reports for our members."
  },
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. We implement bank-level encryption for all data transmission and storage. We never store sensitive financial credentials, and all analysis is performed using aggregated and anonymized data. Our platform is SOC 2 compliant and undergoes regular security audits."
  }
]

export function FAQSection() {
  const [showAll, setShowAll] = useState(false)
  const visibleFaqs = showAll ? faqs : faqs.slice(0, 8)

  return (
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Heading on the left */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 leading-tight">
            Frequently Asked
            <br />
            Questions
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Everything you need to know about our investment intelligence platform and stock return forecasts.
          </p>
        </div>

        {/* Accordions on the right */}
        <div>
          <Accordion type="single" collapsible className="w-full">
            {visibleFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base sm:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {faqs.length > 8 && (
            <div className="mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-muted-foreground hover:text-muted-foreground/80 transition-colors text-sm cursor-pointer inline-flex items-center gap-1"
              >
                {showAll ? (
                  <>
                    <Minus className="h-3 w-3" />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    <span>Show more ({faqs.length - 8} more)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
