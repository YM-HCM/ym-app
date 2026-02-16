'use client'

import { DollarSign, ExternalLink } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { JotformEmbed } from '@/components/finance/JotformEmbed'
import {
  FINANCE_DEPARTMENT,
  FINANCE_FORM_ID,
  FINANCE_SECTIONS,
} from '@/data/finance'

export function FinanceContent() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] md:min-h-screen px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Page Header */}
        <div
          className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {FINANCE_DEPARTMENT.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {FINANCE_DEPARTMENT.subtitle}
              </p>
            </div>
          </div>
          <div className="ml-[52px] text-sm text-muted-foreground space-y-0.5">
            <p>CFO: {FINANCE_DEPARTMENT.cfo}</p>
            <p>National Shura Rep: {FINANCE_DEPARTMENT.nationalShuraRep}</p>
          </div>
        </div>

        {/* Accordion Sections */}
        <div
          className="animate-in fade-in slide-in-from-bottom-4 duration-200"
          style={{ animationDelay: '100ms' }}
        >
          <Accordion
            type="multiple"
            defaultValue={['finance-form']}
            className="w-full"
          >
            {/* Main Finance Request Form */}
            <AccordionItem value="finance-form">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>Finance Requests Form</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-1">
                  <JotformEmbed
                    formId={FINANCE_FORM_ID}
                    title="YM Finance Requests Form"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Dynamic sections from data */}
            {FINANCE_SECTIONS.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <section.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{section.name}</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {section.items.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-1">
                    {section.items.map((item) => (
                      <a
                        key={item.url}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px]"
                      >
                        <span className="flex-1">
                          <span className="block">{item.title}</span>
                          {item.description && (
                            <span className="block text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
