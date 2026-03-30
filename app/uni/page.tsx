import Link from 'next/link';
import { 
  GraduationCap, Mail, BookOpen, UserCircle, CheckSquare, 
  Printer, Monitor, MonitorPlay, HardDrive, CalendarCheck, 
  Calendar, Users, Server, Building, Compass, Globe, Bus
} from 'lucide-react';

const CORE_SHORTCUTS = [
  { href: 'https://myport.port.ac.uk/', icon: Compass, title: 'MyPort', desc: 'Student Portal & Information.' },
  { href: 'https://timetabling.port.ac.uk/CMISGo/Web/Timetable', icon: Calendar, title: 'Timetable', desc: 'View class schedule.' },
  { href: 'https://outlook.office.com/mail/', icon: Mail, title: 'Uni Mail', desc: 'Access student Outlook Mail.' },
  { href: 'https://moodle.port.ac.uk/', icon: BookOpen, title: 'Moodle', desc: 'Course materials & submissions.' },
  { href: 'https://student-system.port.ac.uk/urd/sits.urd/run/siw_sso.saml', icon: UserCircle, title: 'Student View (SITS)', desc: 'Check grades, modules, and admin.' },
  { href: 'https://docs.google.com/spreadsheets/d/1hS4vt0g3Tq3updiZxSlnJwenOP0ToHFoEIoPWPn6IaA/edit?usp=sharings', icon: CheckSquare, title: 'TO-DO List', desc: 'Track tasks and deadlines.' },
];

const IT_SERVICES = [
  { href: 'https://www.port.ac.uk/', icon: Globe, title: 'UoP Website', desc: 'Main University website.' },
  { href: 'https://myprint.port.ac.uk/user', icon: Printer, title: 'Printing *', desc: 'Web Printing Link' },
  { href: 'https://keyserver.port.ac.uk/home/Main', icon: Monitor, title: 'Remote Access *', desc: 'Access Lab Computers', extraLink: { href: 'https://myport.port.ac.uk/guidance-and-support/student-it-support/using-university-computers-and-laptops/remote-access-to-lab-computers', text: 'How To Guide' } },
  { href: 'https://appsanywhere.port.ac.uk/login', icon: MonitorPlay, title: 'AppsAnywhere', desc: 'Access required software.' },
  { href: 'https://sdtools.port.ac.uk/findmyndrive/', icon: HardDrive, title: 'Localise N Drive *', desc: 'Required Tool', extraLink: { href: 'https://myport.port.ac.uk/guidance-and-support/student-it-support/how-to-store-your-files', text: 'How to Use' } },
  { href: 'https://app.powerbi.com/groups/me/apps/37518a7a-102b-45de-85a2-47a2dd80ec55/reports/734aa760-ca4b-4c81-8355-5386e6b79d4d/ReportSection46e32ce6bd760951aa77?experience=power-bi', icon: CalendarCheck, title: 'Attendance', desc: 'Check your record.' },
  { href: 'https://www.port.ac.uk/about-us/key-dates', icon: Calendar, title: 'Key Dates', desc: 'Important academic dates.' },
  { href: 'https://moodle.port.ac.uk/course/view.php?id=9173', icon: Users, title: 'Academic Tutor', desc: 'Find available support.' },
  { href: 'https://uop-1-server-per-student-prod.appspot.com/instance/get', icon: Server, title: 'University VM', desc: 'Access VM', extraLink: { href: 'https://docs.google.com/document/d/1c51G-G6du82NTc5VRGBEpZiDyNJxUg-jSsSpk2tP0rs/edit?pli=1&tab=t.0', text: 'How To Guide' } },
  { href: 'https://librarystudyrooms.port.ac.uk/RoomBooking.dll', icon: Building, title: 'Book a Room', desc: 'Reserve library study space.' },
];

const BUSES = [
  { 
    href: 'https://publications.docstore.port.ac.uk/A790056.pdf', 
    icon: Bus, 
    title: 'U1 Bus Timetable', 
    desc: 'View U1 stops and times.',
    image: 'https://myport.port.ac.uk/sites/default/files/styles/image_with_caption_desktop/public/media/images/U1%20Circular%20Route.PNG.webp?itok=i26HyoJB'
  },
  { 
    href: 'https://publications.docstore.port.ac.uk/A1000163.pdf', 
    icon: Bus, 
    title: 'U2 Bus Timetable', 
    desc: 'View U2 stops and times.',
    image: 'https://myport.port.ac.uk/sites/default/files/styles/image_with_caption_desktop/public/media/images/U2%20Route.PNG.webp?itok=EvB72LI9'
  },
];

interface BusService {
  href: string;
  icon: any;
  title: string;
  desc: string;
  image: string;
}

export default function UniDash() {
  return (
    <div className="min-h-screen bg-[#0c1422] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-400 tracking-tight">UoP Dashboard</h1>
          <p className="text-slate-400 mt-2">Helpful UoP Student link dashboard</p>
          
          <div className="mt-4 flex justify-center">
            <Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
              ← Return to Dashboard
            </Link>
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-extrabold text-cyan-500 border-b-2 border-white/10 pb-2 mb-6">Core Shortcuts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CORE_SHORTCUTS.map((item, idx) => (
              <a 
                key={idx} 
                href={item.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#172033] p-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all flex flex-col min-h-[120px]"
              >
                <item.icon className="w-6 h-6 text-cyan-500 mb-2" />
                <h3 className="text-lg font-bold text-slate-100">{item.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
              </a>
            ))}
          </div>
        </section>

        <section id="services" className="mb-12">
          <h2 className="text-2xl font-extrabold text-cyan-500 border-b-2 border-white/10 pb-2 mb-4">IT Services & Support</h2>
          <p className="text-sm text-slate-500 mb-6"><strong className="text-red-400">*</strong> = Requires School VPN or on-campus network.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {IT_SERVICES.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-[#172033] p-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all flex flex-col min-h-[120px]"
              >
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex-grow">
                  <item.icon className="w-6 h-6 text-cyan-500 mb-2" />
                  <h3 className="text-lg font-bold text-slate-100">{item.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                </a>
                {item.extraLink && (
                  <a 
                    href={item.extraLink.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:underline mt-3 block"
                  >
                    {item.extraLink.text}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="buses" className="mb-12">
          <h2 className="text-2xl font-extrabold text-cyan-500 border-b-2 border-white/10 pb-2 mb-6">Bus Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(BUSES as BusService[]).map((item, idx) => (
              <a 
                key={idx} 
                href={item.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-[#172033] rounded-xl shadow-md hover:shadow-xl hover:shadow-cyan-500/20 transition-all overflow-hidden flex flex-col md:flex-row"
              >
                <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden">
                   <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172033] to-transparent md:hidden" />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <item.icon className="w-8 h-8 text-cyan-500 mb-3" />
                  <h3 className="text-xl font-bold text-slate-100">{item.title}</h3>
                  <p className="text-sm text-slate-400 mt-2">{item.desc}</p>
                  <span className="text-xs text-cyan-400 mt-4 font-semibold uppercase tracking-wider group-hover:underline">
                    View Timetable PDF →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
