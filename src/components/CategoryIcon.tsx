import React from 'react'
import {
  Camera,
  Zap,
  Wrench,
  Shield,
  BellRing,
  Network,
  DoorOpen,
  PhoneCall,
  Search,
  Hammer,
  HelpCircle,
  LucideProps,
} from 'lucide-react'

export const CategoryIcon: React.FC<LucideProps & { name: string }> = ({ name, ...props }) => {
  switch (name) {
    case 'Camera':
      return <Camera {...props} />
    case 'Zap':
      return <Zap {...props} />
    case 'Wrench':
      return <Wrench {...props} />
    case 'Shield':
      return <Shield {...props} />
    case 'BellRing':
      return <BellRing {...props} />
    case 'Network':
      return <Network {...props} />
    case 'DoorOpen':
      return <DoorOpen {...props} />
    case 'PhoneCall':
      return <PhoneCall {...props} />
    case 'Search':
      return <Search {...props} />
    case 'Hammer':
      return <Hammer {...props} />
    default:
      return <HelpCircle {...props} />
  }
}
