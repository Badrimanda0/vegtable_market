import { getImagesGroupedByDate } from '../actions';
import GalleryList from './GalleryList';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const groupedImages = await getImagesGroupedByDate();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Image Gallery</h1>
        <p style={{ color: 'var(--text-muted)' }}>All uploaded bills and receipts</p>
      </div>
      
      <GalleryList groupedImages={groupedImages} />
    </div>
  );
}
