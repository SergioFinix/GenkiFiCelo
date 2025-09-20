/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // GenkiFi custom colors
        genki: {
          green: "#10B981",
          blue: "#3B82F6",
          gold: "#F59E0B",
          purple: "#8B5CF6",
          pink: "#EC4899",
        },
        gradient: {
          primary: "from-green-400 to-blue-500",
          secondary: "from-purple-400 to-pink-500",
          accent: "from-yellow-400 to-orange-500",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)",
        "gradient-secondary": "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
        "gradient-accent": "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
        "glass": "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glow": "0 0 20px rgba(59, 130, 246, 0.5)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.5)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
