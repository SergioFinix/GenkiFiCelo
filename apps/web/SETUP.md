# GenkiFi Setup Instructions

## Environment Variables

Create a `.env.local` file in the `/apps/web` directory with the following variables:

```env
# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here

# Celo Network Configuration
NEXT_PUBLIC_CELO_NETWORK=alfajores

# Contract Addresses
NEXT_PUBLIC_GENKIFI_CORE_ADDRESS=0x...
NEXT_PUBLIC_CUSD_TOKEN_ADDRESS=0x765DE816845861e75A25fCA122bb6898B8B1282a

# API Keys
NEXT_PUBLIC_CELOSCAN_API_KEY=your_celoscan_api_key_here

# App Configuration
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=GenkiFi
NEXT_PUBLIC_APP_DESCRIPTION=The first gamified social DeFi platform
```

## Getting Started

1. **Install Dependencies**
   ```bash
   cd apps/web
   npm install
   ```

2. **Get Thirdweb Client ID**
   - Go to [thirdweb.com](https://thirdweb.com)
   - Create an account and project
   - Copy your Client ID to the environment variables

3. **Configure Contract Addresses**
   - Deploy your GenkiFiCore contract using Hardhat Ignition
   - Update `NEXT_PUBLIC_GENKIFI_CORE_ADDRESS` with the deployed address
   - The cUSD address is already configured for Alfajores testnet

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Connect your wallet using Thirdweb
   - Start using GenkiFi!

## Features Implemented

### ✅ Completed
- Landing page with hero, benefits, how it works, and stats sections
- Dashboard with user stats, circles, daily workouts, and AI coach
- Thirdweb integration for wallet connection and Web3 interactions
- Responsive design with glassmorphism effects
- Custom Tailwind configuration with GenkiFi branding
- Component architecture with reusable UI components

### 🔄 In Progress
- Contract integration with actual deployed contracts
- Real-time data fetching from blockchain
- Advanced animations with Framer Motion

### 📋 Todo
- Circle creation and management functionality
- Investment strategy voting system
- DeFi protocol integration (Aave V3)
- Achievement system implementation
- Mobile app optimization

## Architecture

### Components Structure
```
src/
├── components/
│   ├── ui/                 # Base UI components
│   ├── landing/           # Landing page sections
│   ├── dashboard/         # Dashboard components
│   └── web3/             # Web3 integration components
├── lib/
│   ├── thirdweb/         # Thirdweb configuration
│   └── utils/            # Utility functions
└── app/                  # Next.js app router pages
```

### Key Features
- **Social Investment Circles**: Groups of 8-12 friends investing together
- **Gamified Learning**: XP system with daily workouts and achievements
- **Real DeFi Yields**: Integration with Aave V3 on Celo
- **AI Coach**: Personalized recommendations and insights
- **Mobile-First**: Optimized for mobile devices with PWA capabilities

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Configure reverse proxy (nginx) for custom domain

## Support

For issues and questions:
- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Join the [Discord Community](https://discord.gg/your-invite)
- Follow [@GenkiFi](https://twitter.com/genkifi) for updates
