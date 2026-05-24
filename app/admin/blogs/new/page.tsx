import { redirect } from 'next/navigation';

export default function NewBlogPage() {
  // For now, redirect to the main blogs page
  // In a full implementation, this would be a form to create a new blog
  redirect('/admin/blogs');
}
