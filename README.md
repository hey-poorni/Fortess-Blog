# Fortress Blog | Secure & Intelligent Publishing

A production-ready blog platform built with Next.js 15, featuring AI-powered summarization and real-time social interactions.

## 🏛 Architectural Principles

### 🔐 Ironclad Authentication
- **Provider**: Firebase Authentication.
- **Security**: Automated password hashing and JWT rotation via Google Identity Services.
- **Route Guards**: Client-side protection with `useUser()` and server-side enforcement via Firestore Security Rules.

### 🏛 Relational Data Model (Firestore Mapping)
- **Users**: `/users/{userId}` - Master profile records.
- **Author Dashboard**: `/users/{userId}/blogs/{blogId}` - Private control plane for drafts and management.
- **Public Feed**: `/public_blogs/{blogId}` - Read-optimized collection with denormalized engagement metrics.
- **Social Graph**:
  - `/public_blogs/{blogId}/comments`: Real-time indexed discussion.
  - `/public_blogs/{blogId}/likes/{userId}`: Hard database-level constraint (one like per user) achieved by using User UID as Document ID.

### 🤖 Generative AI (Genkit v1.x)
- **Auto-Summarization**: Async Genkit flow triggered during the save cycle to generate engaging meta-descriptions.
- **AI Assistant**: Intelligent draft generation from topics using Gemini 2.5 Flash.

## 🛠 Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, ShadCN UI.
- **Backend**: Google Cloud Firestore, Firebase Auth.
- **AI**: Genkit, Gemini 2.5 Flash.
- **Icons**: Lucide React.
- **Fonts**: Space Grotesk (Headline), Inter (Body).

## 🚀 Performance Optimization
- **Zero N+1 Queries**: Engagement counts (likes/comments) are denormalized into the main blog document.
- **Real-time Snapshots**: Updates appear instantly without page reloads using Firestore `onSnapshot`.
- **Atomic Operations**: Using `increment()` for reliable count synchronization.
