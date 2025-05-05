
import { BookmarkList } from "@/components/BookmarkList";

export default function BookmarksPage() {
  return (
    <div className="container py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Bookmarks</h1>
      <BookmarkList />
    </div>
  );
}
