import {
  MessageCircle,
  ClipboardList,
  FileText,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type FinanceLink = {
  title: string
  url: string
  description?: string
}

export type FinanceSection = {
  id: string
  name: string
  icon: LucideIcon
  items: FinanceLink[]
}

export const FINANCE_DEPARTMENT = {
  title: 'YM Finance',
  subtitle: 'Office of Finance · Central. Streamlined. Efficient.',
  cfo: 'Shaheer Iqbal (2025–2027)',
  nationalShuraRep: 'Imaad Khan',
}

export const FINANCE_FORM_ID = '233184710128148'

export const FINANCE_SECTIONS: FinanceSection[] = [
  {
    id: 'contact',
    name: 'Contact Finance',
    icon: MessageCircle,
    items: [
      {
        title: 'Message Shaheer on WhatsApp',
        url: 'https://api.whatsapp.com/send/?phone=%2B12017552429&text=Salam%2C%0AI+am+%5BENTER+NAME%5D+from+%5BENTER%5D+asking+about+%5BENTER+BUDGET%5D%0A%0A%5BENTER+QUESTION%5D&type=phone_number&app_absent=0',
        description: 'Primary contact — CFO',
      },
      {
        title: 'Escalation Contact (if no response)',
        url: 'https://api.whatsapp.com/send/?phone=%2B18159191088&text=Salam%2C%0AI+am+%5BENTER+NAME%5D+from+%5BENTER%5D+asking+about+%5BENTER+BUDGET%5D%0A%0A%5BENTER+QUESTION%5D%0A%0AShaheer+did+not+respond...+&type=phone_number&app_absent=0',
        description: 'If Shaheer does not respond',
      },
    ],
  },
  {
    id: 'additional-forms',
    name: 'Additional Forms',
    icon: ClipboardList,
    items: [
      {
        title: 'Forgot an Attachment? Submit here',
        url: 'https://www.jotform.com/app/260205420248143/252798675212063',
      },
      {
        title: 'View My Finance Submissions',
        url: 'https://www.jotform.com/app/260205420248143/page/6',
      },
    ],
  },
  {
    id: 'rules-policies',
    name: 'Rules & Policies',
    icon: FileText,
    items: [
      {
        title: 'Finance Governing Rules',
        url: '/finance_rules.png',
        description: 'Visual overview of payment and transaction rules',
      },
      {
        title: 'Official Spending Policy (January 2026)',
        url: '/official_spending_policy.pdf',
        description: 'Full spending framework approved by National Shura',
      },
    ],
  },
  {
    id: 'town-hall',
    name: 'Finance Town Hall',
    icon: Video,
    items: [
      {
        title: 'Most Recent Finance Town Hall',
        url: 'https://youtu.be/N3oLAz9qgY0?si=Y84ehe45n3Sp2fu8',
        description: 'Latest town hall recording',
      },
    ],
  },
]
