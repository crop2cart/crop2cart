import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Raj Sharma",
    role: "Apple Farmer",
    quote:
      "With Home Guardian, I can sell directly to customers without any middlemen. I get fair prices and my customers get the freshest apples possible.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    region: "Himachal Pradesh",
  },
  {
    name: "Priya Patel",
    role: "Organic Berry Farmer",
    quote:
      "Our small farm finally has a platform where quality and fairness matter. The support from Home Guardian has transformed our business.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    region: "Karnataka",
  },
  {
    name: "Vijay Kumar",
    role: "Citrus Farmer",
    quote:
      "No more dealing with traders who take 40% of my earnings. Home Guardian connects us directly with people who care about fresh fruit.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    region: "Maharashtra",
  },
  {
    name: "Anjali Singh",
    role: "Mango Farmer",
    quote:
      "My customers reach out and thank me personally. That connection and fair pricing makes this the best decision I made for my farm.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    region: "Uttar Pradesh",
  },
];

export function FarmerStories() {
  return (
    <div className="py-24 bg-muted/30">
      <div className="max-w-(--breakpoint-xl) mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Stories from Our Farmers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real farmers, real success stories. Discover how direct-to-consumer
            farming is transforming lives.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-dashed bg-background hover:bg-muted/50 transition-colors"
            >
              {/* Quote Icon */}
              <Quote className="size-6 text-primary mb-4" />

              {/* Quote Text */}
              <p className="text-foreground mb-6 leading-relaxed italic">
                "{testimonial.quote}"
              </p>

              {/* Farmer Info */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.region}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
