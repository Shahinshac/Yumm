import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Header */}
      <header className="bg-primary text-white">
        <nav className="container mx-auto px-md py-lg flex justify-between items-center">
          <h1 className="text-2xl font-bold">🍔 Yumm</h1>
          <div className="space-x-md">
            <Link href="/login" className="hover:opacity-80">
              Login
            </Link>
            <Link href="/register" className="hover:opacity-80">
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-xl">
        <div className="container mx-auto px-md text-center">
          <h2 className="text-4xl font-bold mb-md">Order Delicious Food Online</h2>
          <p className="text-lg mb-lg opacity-90">
            Quick, easy, and reliable food delivery at your doorstep
          </p>
          <div className="space-x-md">
            <Link href="/restaurants" className="btn-primary bg-accent text-black hover:bg-opacity-80">
              Browse Restaurants
            </Link>
            <Link href="/register" className="btn-outline">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-xl bg-neutral">
        <div className="container mx-auto px-md">
          <h3 className="text-3xl font-bold text-center mb-xl">Why Choose Yumm?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {[
              {
                icon: "⚡",
                title: "Fast Delivery",
                desc: "Get your food delivered in 30 minutes or less",
              },
              {
                icon: "🔒",
                title: "Secure Payment",
                desc: "Safe and encrypted payment methods",
              },
              {
                icon: "⭐",
                title: "Quality Assured",
                desc: "Top-rated restaurants and reviews",
              },
            ].map((feature, idx) => (
              <div key={idx} className="card text-center">
                <div className="text-4xl mb-md">{feature.icon}</div>
                <h4 className="text-xl font-bold mb-sm">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-lg">
        <div className="container mx-auto px-md text-center">
          <p>&copy; 2024 Yumm Food Delivery. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
