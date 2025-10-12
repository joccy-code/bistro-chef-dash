import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, Heart, Award, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">About Us</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Welcome to our restaurant, where tradition meets innovation in every dish
        </p>
      </div>

      {/* Story Section */}
      <section className="mb-16">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="mb-4 text-3xl font-bold">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded with a passion for authentic Ethiopian cuisine, our restaurant has been serving
                the community for years with dedication and love. Every dish we prepare tells a story
                of our heritage and culture.
              </p>
              <p>
                We believe in using only the freshest ingredients, traditional cooking methods,
                and recipes passed down through generations. Our commitment to quality and authenticity
                has made us a beloved destination for food lovers.
              </p>
              <p>
                From our family to yours, we invite you to experience the warmth, flavor, and hospitality
                that define Ethiopian dining culture.
              </p>
            </div>
          </div>
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            <div className="flex h-full items-center justify-center">
              <UtensilsCrossed className="h-24 w-24 text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Our Values</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Passion</h3>
              <p className="text-muted-foreground">
                We pour our heart into every dish, ensuring each meal is prepared with love and care
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Quality</h3>
              <p className="text-muted-foreground">
                Only the finest ingredients make it to our kitchen, guaranteeing authentic flavors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Community</h3>
              <p className="text-muted-foreground">
                We're more than a restaurant – we're a gathering place for friends and family
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="rounded-lg bg-muted/30 p-8 text-center">
        <h2 className="mb-4 text-3xl font-bold">Meet Our Team</h2>
        <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
          Our talented chefs and dedicated staff work together to bring you an unforgettable
          dining experience. With years of combined experience in Ethiopian cuisine, we're
          committed to excellence in every aspect of your visit.
        </p>
        <div className="flex justify-center gap-4">
          <div className="h-24 w-24 rounded-full bg-muted" />
          <div className="h-24 w-24 rounded-full bg-muted" />
          <div className="h-24 w-24 rounded-full bg-muted" />
        </div>
      </section>
    </div>
  );
}
