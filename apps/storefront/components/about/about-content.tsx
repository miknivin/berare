"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FlaskConical,
  Leaf,
  ShieldCheck,
  Heart,
  Target,
  Eye,
  Gem,
  Sparkles,
  Quote,
} from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";

const WHY_BERARE_POINTS = [
  { icon: Leaf, label: "Thoughtful Ingredients" },
  { icon: FlaskConical, label: "Smart Formulation" },
  { icon: ShieldCheck, label: "Reliable Quality" },
  { icon: Heart, label: "Better Experience" },
];

const APPROACH_STEPS = [
  {
    number: "01",
    title: "Ingredients",
    description:
      "Thoughtfully selected ingredients, each with a clear role in the formulation.",
  },
  {
    number: "02",
    title: "Formulation",
    description:
      "Designed around everyday usability, skin feel, and real routines — not just trends.",
  },
  {
    number: "03",
    title: "Quality",
    description:
      "A commitment to consistency, responsible manufacturing, and quality-focused processes.",
  },
  {
    number: "04",
    title: "Experience",
    description:
      "A good skincare product shouldn't just perform — it should feel good to use.",
  },
];

const VALUE_CARDS = [
  {
    icon: Target,
    eyebrow: "Our Mission",
    title: "Make Thoughtful Beauty More Accessible",
    body: "We create skincare that makes everyday self-care easier, more enjoyable, and more meaningful — products people can confidently build a routine around.",
  },
  {
    icon: Eye,
    eyebrow: "Our Vision",
    title: "A Brand People Truly Believe In",
    body: "We're building Berare into a name known for purpose-driven skincare, thoughtful formulations, consistent quality, and honest communication.",
  },
  {
    icon: Gem,
    eyebrow: "What Makes Us Different",
    title: "We Don't Want to Be Just Another Beauty Brand",
    body: "Every detail — from formulation to packaging — is a chance to create a better experience, not just another product on a shelf.",
  },
];

const PROMISE_CARDS = [
  {
    icon: ShieldCheck,
    eyebrow: "Quality First",
    title: "Because What Goes on Your Skin Matters",
    body: "Trust is earned one product at a time. We take ingredients, packaging, and manufacturing standards seriously, every time.",
  },
  {
    icon: Heart,
    eyebrow: "Berare Is For You",
    title: "For Every Skin, Every Story",
    body: "Whether you're starting your first routine or refining one you've had for years — Berare is made for people who choose to take care of themselves, every day.",
  },
  {
    icon: Sparkles,
    eyebrow: "Our Promise",
    title: "Purpose Over Hype, Quality Over Compromise",
    body: "We'll keep learning, keep improving, and keep listening. Because for us, Berare is a commitment to doing beauty differently.",
  },
];

export function AboutContent() {
  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-white via-muted to-secondary/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-secondary/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 pt-10 md:py-0 grid md:grid-cols-2 items-center gap-6 md:h-140">
          {/* Fills the empty seam between the text and the photo — sized
              and faded to read as background texture, not a focal
              element, sitting behind the "Real care..." caption. */}
          <Image
            src="/about-us/leaf-vector.png"
            alt=""
            width={600}
            height={900}
            aria-hidden="true"
            className="hidden md:block pointer-events-none select-none absolute left-[40%] top-1/2 -translate-y-1/2 h-72 lg:h-80 w-auto opacity-25"
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 max-w-sm"
          >
            <p className="text-xs font-medium tracking-widest uppercase text-primary mb-3">
              About Us
            </p>
            <h1 className="font-heading font-bold text-5xl md:text-7xl leading-none text-primary">
              Berare
            </h1>
            <p className="mt-2 font-serif italic text-xl md:text-2xl text-muted-foreground">
              Science Behind Beauty
            </p>
            <div className="w-14 h-px bg-primary/40 my-5" />
            <p className="text-base md:text-lg text-foreground/80 max-w-sm">
              Beauty with purpose.
              <br />
              Skincare with intention.
            </p>
          </motion.div>

          {/* Section height is fixed (md:h-140) rather than derived from
              the image; object-cover fills it, cropping as needed.
              Columns stay an even 50/50 split. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="relative h-80 sm:h-96 md:h-full"
          >
            {/* Brand tagline in a real script font (matches the reference)
                — desktop only, tucked into the seam between text and photo. */}
            <p className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-2 xl:-left-6 z-10 text-right font-cursive text-3xl xl:text-4xl text-primary leading-tight">
              Real care.
              <br />
              Real results.
              <br />
              Truly Berare.
            </p>
            <Image
              src="/about-us/about-1.webp"
              alt="Berare — science behind beauty"
              fill
              priority
              className="object-cover object-center"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <Reveal>
          <p className="text-xs font-medium tracking-widest uppercase text-primary mb-3">
            Who We Are
          </p>
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-5 leading-tight">
            A Brand Built on Care and Curiosity
          </h2>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            At Berare, beauty isn&apos;t about changing who you are — it&apos;s
            about bringing out the best in your skin and helping you feel
            confident in it.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Born from a passion for modern, purposeful skincare, Berare creates
            products designed to fit into real routines — not complicate them.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative rounded-3xl overflow-hidden bg-muted max-w-sm mx-auto md:mx-0 md:ml-auto">
            {/* about-3.png is a portrait (2:3) source — matching that
                aspect here instead of a landscape crop keeps the whole
                dropper/petri-dish composition visible instead of cutting
                most of it away. Capped to max-w-sm so it doesn't tower
                over the text column at full column width. */}
            <div className="relative aspect-2/3">
              <Image
                src="/about-us/about-3.png"
                alt="Berare formulation lab — dropper and botanical ingredients"
                fill
                className="object-cover"
                loading="lazy"
                sizes="(min-width: 768px) 40vw, 90vw"
              />
            </div>

            <div className="absolute -bottom-px left-0 right-0 bg-white/90 backdrop-blur px-6 py-5 md:px-8 md:py-6">
              <Quote className="w-5 h-5 text-primary mb-2" aria-hidden="true" />
              <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
                Our approach is simple: understand what skin needs, formulate
                with purpose, and create products people genuinely enjoy using.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Why Berare */}
      <section className="bg-secondary/25 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <Reveal>
            <p className="text-xs font-medium tracking-widest uppercase text-primary mb-3">
              Why Berare?
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-5 leading-tight">
              Beauty With a Reason
            </h2>
            <p className="text-foreground/70 leading-relaxed mb-2">
              The beauty industry is full of trends. We choose to focus on what
              actually matters — thoughtful ingredients, real formulation, and
              products that work for everyday life.
            </p>
            <p className="font-medium">Simple. Purposeful. Effective.</p>
          </Reveal>

          <Reveal delay={0.15} className="grid grid-cols-2 gap-5">
            {WHY_BERARE_POINTS.map(({ icon: Icon, label }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex flex-col items-center text-center gap-3 bg-white rounded-2xl p-6"
              >
                <span className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </span>
                <p className="text-sm font-medium">{label}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Our Approach */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <Reveal className="order-2 md:order-1">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted">
            <Image
              src="/about-us/about-2.jpg"
              alt="Berare formulation — dropper and aloe vera"
              fill
              className="object-cover"
              loading="lazy"
              sizes="(min-width: 768px) 40vw, 90vw"
            />
          </div>
        </Reveal>

        <div className="order-1 md:order-2">
          <Reveal>
            <p className="text-xs font-medium tracking-widest uppercase text-primary mb-3">
              Our Approach
            </p>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-5 leading-tight">
              Science Behind Beauty
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Beauty and science don&apos;t have to exist separately. Our
              philosophy is built around understanding ingredients, formulation,
              and everyday skincare habits — not just attractive packaging or
              passing trends.
            </p>
          </Reveal>

          <div className="space-y-5">
            {APPROACH_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="flex gap-4"
              >
                <span className="shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                  {step.number}
                </span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Vision / Different */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-6">
        <div className="grid md:grid-cols-3 gap-6">
          {VALUE_CARDS.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.1}>
              <div className="h-full rounded-2xl border border-border p-7 bg-white">
                <card.icon
                  className="w-6 h-6 text-primary mb-4"
                  aria-hidden="true"
                />
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  {card.eyebrow}
                </p>
                <h3 className="font-heading font-bold text-lg mb-3 leading-snug">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Quality / For You / Promise */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-6 pb-16 md:pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {PROMISE_CARDS.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.1}>
              <div className="h-full rounded-2xl bg-muted/60 p-7">
                <card.icon
                  className="w-6 h-6 text-primary mb-4"
                  aria-hidden="true"
                />
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  {card.eyebrow}
                </p>
                <h3 className="font-heading font-bold text-lg mb-3 leading-snug">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Reveal>
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 md:px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <p className="font-serif italic text-2xl md:text-3xl mb-2">
                Berare
              </p>
              <p className="text-sm text-primary-foreground/80 tracking-wide uppercase mb-3">
                Science Behind Beauty
              </p>
              <p className="text-primary-foreground/80 max-w-md">
                Discover beauty with purpose. Discover skincare made for
                everyday life.
              </p>
            </div>
            <Link
              href="/products"
              className="shrink-0 inline-flex items-center min-h-11 rounded-full border border-primary-foreground/60 px-8 py-3 text-sm font-medium hover:bg-primary-foreground hover:text-primary transition-colors"
            >
              Explore Our Products
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
