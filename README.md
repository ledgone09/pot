# Solana Jackpot Platform

A modern, real-time jackpot platform built on Solana with 60-second betting cycles, Phantom wallet integration, and provably fair winner selection.

## 🎯 Features

### Core Functionality
- **60-Second Rounds**: Fast-paced jackpot cycles with automated winner selection
- **Phantom Wallet Integration**: Seamless connection with Solana's most popular wallet
- **Real-time Updates**: Live betting, timer, and winner announcements via WebSocket
- **Provably Fair**: Transparent and verifiable winner selection algorithm
- **Responsive Design**: Beautiful UI that works on desktop and mobile

### User Experience
- **Animated Interface**: Smooth animations with Framer Motion
- **Live Timer**: Circular countdown with color-coded phases
- **Participant Tracking**: Real-time list of current round entries
- **Winner Celebrations**: Confetti animations and winner announcements
- **User Statistics**: Track your betting history and winnings

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Zustand State Management**: Efficient global state handling
- **Tailwind CSS**: Modern, utility-first styling
- **Socket.io**: Real-time bidirectional communication
- **Next.js 14**: Latest React framework with App Router

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Phantom Wallet browser extension

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd solana-jackpot-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Install server dependencies**
```bash
cd server
npm install
cd ..
```

4. **Start the development servers**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and approve the Phantom connection
2. **Place Bets**: Choose your bet amount (0.01 - 10 SOL) and click "Place Bet"
3. **Watch the Timer**: Betting closes 5 seconds before round end
4. **Winner Selection**: Algorithm selects winner based on weighted entries
5. **Collect Winnings**: Winners receive 90% of the total pool

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Custom animations
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Wallet Integration**: Solana Wallet Adapter
- **Real-time**: Socket.io Client

### Backend Stack
- **Server**: Node.js + Express
- **Real-time**: Socket.io
- **CORS**: Enabled for cross-origin requests

### Solana Integration
- **Network**: Devnet (configurable)
- **Wallet**: Phantom Wallet Adapter
- **Transactions**: Direct SOL transfers
- **RPC**: Configurable endpoint

## 📁 Project Structure

```
solana-jackpot-platform/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── BettingInterface.tsx
│   ├── CircularTimer.tsx
│   ├── Header.tsx
│   ├── JackpotDisplay.tsx
│   ├── ParticipantsList.tsx
│   ├── RecentWinners.tsx
│   ├── WalletProvider.tsx
│   └── WinnerAnnouncement.tsx
├── hooks/                 # Custom React hooks
│   └── useSocket.ts
├── lib/                   # Utility libraries
│   └── solana.ts
├── store/                 # State management
│   └── jackpotStore.ts
├── types/                 # TypeScript definitions
│   └── index.ts
├── server/                # Backend server
│   ├── index.js          # Express + Socket.io server
│   └── package.json      # Server dependencies
└── README.md
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Platform Settings

Modify `lib/solana.ts` to configure:
- Minimum/Maximum bet amounts
- Platform fee percentage
- Platform wallet address
- RPC endpoint

## 🎨 Customization

### Styling
- Colors: Edit `tailwind.config.js` color palette
- Animations: Modify keyframes in `tailwind.config.js`
- Components: Update component styles in respective files

### Game Logic
- Round duration: Change `roundDuration` in `server/index.js`
- Betting limits: Update `PLATFORM_CONFIG` in `lib/solana.ts`
- Winner algorithm: Modify `calculateWinner` function

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start frontend development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run server       # Start backend server
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Create new project on hosting platform
2. Connect repository
3. Set `PORT` environment variable
4. Deploy server directory

## 🔒 Security Considerations

- **Wallet Security**: Never store private keys
- **Transaction Validation**: Always validate on-chain
- **Rate Limiting**: Implement in production
- **HTTPS**: Use secure connections in production
- **Environment Variables**: Keep sensitive data secure

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure Phantom wallet is installed
   - Check if wallet is unlocked
   - Verify network settings

2. **Transaction Failed**
   - Check SOL balance
   - Verify network connection
   - Ensure betting is still active

3. **Real-time Updates Not Working**
   - Check server is running on port 3001
   - Verify WebSocket connection
   - Check browser console for errors

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the code documentation

---

**⚠️ Disclaimer**: This is a demonstration project. Use at your own risk. Always verify transactions and never bet more than you can afford to lose. 