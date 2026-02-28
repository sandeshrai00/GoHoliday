import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getDb } from '@/lib/turso'
import { tours as toursSchema, tour_categories as tourCategoriesSchema } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import EditTourForm from './EditTourForm'

async function getTour(id) {
  try {
    const db = getDb();
    const result = await db.select().from(toursSchema).where(eq(toursSchema.id, Number(id)));
    const row = result[0] || null;

    if (!row) return null;

    // Fetch existing categories
    const categoriesResult = await db.select({
      category_id: tourCategoriesSchema.category_id
    })
      .from(tourCategoriesSchema)
      .where(eq(tourCategoriesSchema.tour_id, Number(id)));

    const tourData = JSON.parse(JSON.stringify(row));
    tourData.categories = categoriesResult;

    return tourData;
  } catch (error) {
    console.error('Error fetching tour:', error);
    return null;
  }
}

export default async function EditTourPage({ params }) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/admin');
  }

  const { id } = await params;
  const tour = await getTour(id);

  if (!tour) {
    redirect('/admin/dashboard');
  }

  return <EditTourForm tour={tour} />;
}
