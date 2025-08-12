# Infinity Academy Panel

A modern, role-based educational platform built with Next.js, TypeScript, and Tailwind CSS. The platform provides separate dashboards for students, tutors, parents, and administrators with integrated scheduling, homework management, and communication features.

## 🚀 Project Overview

Infinity Academy Panel is a comprehensive educational management system designed to streamline the interaction between students, tutors, parents, and administrators. The platform features a responsive design with role-based access control and modern UI components.

## ✨ Features

### 🎯 Core Functionality

- **Role-Based Dashboards**: Separate interfaces for students, tutors, parents, and administrators
- **Interactive Calendar**: FullCalendar integration for scheduling and lesson management
- **Responsive Design**: Mobile-first approach with drawer navigation
- **Modern UI**: Built with Tailwind CSS and DaisyUI components

### 🎨 User Interface

- **Business Theme**: Professional dark theme optimized for educational use
- **Responsive Navigation**: Collapsible sidebar with mobile-friendly drawer
- **Component Library**: DaisyUI components for consistent design
- **Tailwind CSS**: Utility-first CSS framework for rapid development

### 🔧 Technical Features

- **TypeScript**: Full type safety and better development experience
- **Next.js 14**: Latest React framework with App Router
- **FullCalendar**: Professional calendar component for scheduling
- **Supabase Integration**: Ready for backend database and authentication

## 🏗️ Project Structure

```
InfinityAcademy/
├── public/                 # Static assets
│   └── logo.png           # Application logo
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── admin/         # Admin dashboard
│   │   ├── parent/        # Parent dashboard
│   │   ├── student/       # Student dashboard
│   │   │   └── calendar/  # Student calendar view
│   │   ├── tutor/         # Tutor dashboard
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout component
│   │   └── page.tsx       # Home page
│   └── components/        # Reusable components
│       └── Calendar.tsx   # Calendar component
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## 🛠️ Technology Stack

### Frontend

- **Next.js 14**: React framework with App Router
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS 3**: Utility-first CSS framework
- **DaisyUI 4**: Component library built on Tailwind

### Calendar & Scheduling

- **FullCalendar**: Professional calendar component
- **TimeGrid Plugin**: Week/day view for scheduling
- **Interaction Plugin**: Event handling and user interactions

### Backend & Database

- **Supabase**: Open-source Firebase alternative
- **Supabase SSR**: Server-side rendering support

### Development Tools

- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd InfinityAcademy
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 User Roles & Dashboards

### 🎓 Student Dashboard (`/student`)

- View personal calendar and scheduled lessons
- Access homework assignments
- Earn in-app currency for completed tasks
- Request tutoring sessions

### 👨‍🏫 Tutor Dashboard (`/tutor`)

- Manage lesson schedule
- Review student progress
- Provide AI feedback
- Chat with students and parents

### 👨‍👩‍👧‍👦 Parent Dashboard (`/parent`)

- Monitor child's academic progress
- View scheduled lessons
- Access homework completion status
- Communicate with tutors

### ⚙️ Admin Dashboard (`/admin`)

- User management and role assignment
- System configuration
- Analytics and reporting
- Content management

## 🗓️ Calendar System

The platform includes a comprehensive calendar system built with FullCalendar:

- **Week View**: Default view showing weekly schedule
- **Event Management**: Create, edit, and delete events
- **Interactive**: Drag and drop functionality
- **Responsive**: Adapts to different screen sizes

### Calendar Features

- Time grid layout for precise scheduling
- Event interaction capabilities
- Responsive design for mobile devices
- Integration with role-based dashboards

## 🎨 UI Components

### Design System

- **Theme**: Business theme with dark color scheme
- **Components**: DaisyUI component library
- **Typography**: Consistent text hierarchy
- **Spacing**: Tailwind's spacing scale

### Navigation

- **Sidebar**: Collapsible navigation drawer
- **Mobile**: Hamburger menu for small screens
- **Breadcrumbs**: Clear navigation hierarchy
- **Responsive**: Adapts to all screen sizes

## 🔐 Authentication & Security

**Note**: Authentication is currently stubbed for development purposes.

### Planned Features

- Supabase authentication integration
- Role-based access control
- Secure API endpoints
- Session management

## 📊 Database Schema

The platform is designed to work with Supabase and includes:

### Core Entities

- **Users**: Student, tutor, parent, admin roles
- **Lessons**: Scheduled tutoring sessions
- **Homework**: Assignments and submissions
- **Chat**: Communication between users
- **Coins**: In-app currency system

## 🚧 Development Status

### ✅ Completed

- Project structure and routing
- Basic dashboard layouts
- Calendar component integration
- Responsive design system
- TypeScript configuration

### 🚧 In Progress

- Dashboard content and functionality
- User authentication
- Database integration
- API endpoints

### 📋 Planned

- Homework management system
- Chat functionality
- AI feedback integration
- Payment processing
- Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

### Phase 1: Core Platform (Current)

- [x] Project setup and structure
- [x] Basic routing and layouts
- [x] Calendar integration
- [ ] User authentication
- [ ] Basic CRUD operations

### Phase 2: Enhanced Features

- [ ] Homework management
- [ ] Chat system
- [ ] AI feedback integration
- [ ] Payment processing

### Phase 3: Advanced Features

- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] API documentation
- [ ] Performance optimization

---

**Built with ❤️ for Infinity Academy**
