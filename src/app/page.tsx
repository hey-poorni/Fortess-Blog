import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Lock, Globe, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/Logo';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');

  return (
    <div className="flex flex-col gap-24 py-12">
      <section className="flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-10 text-center lg:text-left animate-in fade-in slide-in-from-left duration-700">
          <div className="flex justify-center lg:justify-start">
            <Logo className="mb-6" iconClassName="h-16 w-16" textClassName="text-5xl" />
          </div>
          <h1 className="text-6xl lg:text-8xl font-headline font-bold text-foreground leading-[1.05] tracking-tighter">
            Publish with <br />
            <span className="text-primary italic">Absolute Confidence</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Fortress is the modern standard for professional blogging. Secure, AI-powered, and designed for architects who value clean, performant code.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-6">
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-xl font-bold bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/feed">
              <Button size="lg" variant="outline" className="h-16 px-10 text-xl font-bold border-2">
                Explore Feed
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right duration-700">
          {heroImage && (
            <Image 
              src={heroImage.imageUrl} 
              alt={heroImage.description} 
              fill 
              className="object-cover transition-transform duration-1000 hover:scale-105"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-8 left-8 right-8 p-6 bg-background/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
             <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">New Feature</p>
             <h4 className="text-xl font-headline font-bold">AI Summarization Engine</h4>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: Shield, title: "Ironclad Security", desc: "Enterprise-grade Firebase Auth and Firestore Security Rules protect every byte." },
          { icon: Zap, title: "GenAI Summaries", desc: "Automated summarization flows ensure your readers get the gist in seconds." },
          { icon: Lock, title: "Private Dashboard", desc: "A secure workspace to manage drafts, analyze metrics, and control your voice." },
          { icon: Globe, title: "Edge Performance", desc: "Public feeds denormalized for speed, delivering zero-latency reading experiences." }
        ].map((feature, i) => (
          <div key={i} className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <feature.icon className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-headline font-bold mb-3">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
          </div>
        ))}
      </section>

      <section className="relative bg-primary rounded-[3rem] p-12 lg:p-24 text-center space-y-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <h2 className="text-5xl lg:text-7xl font-headline font-bold text-primary-foreground leading-tight tracking-tight relative z-10">
          Your story belongs in a <br /><span className="text-accent">Fortress.</span>
        </h2>
        <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto relative z-10 font-medium">
          Join thousands of professional writers who trust our secure architecture for their digital presence.
        </p>
        <div className="flex justify-center relative z-10 pt-4">
           <Link href="/register">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold h-16 px-16 text-xl rounded-2xl shadow-xl transition-all hover:scale-105">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
