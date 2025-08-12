import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is a 3-Year Forward MOIC projection?",
    answer: "MOIC (Multiple on Invested Capital) is a key investment metric that measures the total value of an investment relative to its initial cost. Our 3Y Mode methodology specifically leverages battle-tested frameworks from world-class investors like Bill Gurley, Brad Gerstner, Stanley Druckenmiller, Mary Meeker, and Beth Kindig to estimate potential returns over a 36-month holding period, helping you make informed long-term investment decisions."
  },
  {
    question: "How do you calculate Base, Bear, and Bull cases?",
    answer: "We analyze multiple scenarios using proprietary algorithms that consider market conditions, company fundamentals, industry trends, and macroeconomic factors. The Base case represents the most likely outcome, the Bull case shows optimistic potential, and the Bear case presents conservative estimates to help you understand the full range of possibilities."
  },
  {
    question: "What data sources power your AI predictions?",
    answer: "Our AI models are trained on comprehensive financial data including SEC filings, earnings reports, market data, industry research, and real-time news analysis. We leverage OpenAI's advanced language models combined with our proprietary investment frameworks to deliver institutional-grade insights."
  },
  {
    question: "How often are the investment newsletters sent?",
    answer: "We deliver comprehensive investment analysis newsletters on a weekly basis, typically every Wednesday. Each newsletter includes updated MOIC projections, market insights, and actionable investment opportunities tailored to your portfolio preferences."
  },
  {
    question: "What makes your equity frameworks 'world-class'?",
    answer: "Our frameworks are developed by combining insights from leading investment institutions, validated academic research, and real-world performance data. We continuously refine our models based on market outcomes and incorporate best practices from top-performing fund managers globally."
  },
  {
    question: "Can I customize my investment preferences?",
    answer: "Yes, our platform allows you to set your risk tolerance, investment sectors of interest, and portfolio goals. Our AI then tailors the analysis and recommendations specifically to match your investment profile and objectives."
  },
  {
    question: "How accurate are your MOIC projections historically?",
    answer: "Our projections have demonstrated strong correlation with actual market outcomes, with our Base case scenarios achieving approximately 78% directional accuracy over the past 24 months. We provide transparent performance tracking and regularly publish accuracy reports for our members."
  },
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. We implement bank-level encryption for all data transmission and storage. We never store sensitive financial credentials, and all analysis is performed using aggregated and anonymized data. Our platform is SOC 2 compliant and undergoes regular security audits."
  }
]

export function FAQSection() {
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
            Everything you need to know about our investment intelligence platform and MOIC projections.
          </p>
        </div>

        {/* Accordions on the right */}
        <div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}