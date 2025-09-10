import { listReports } from "@/app/actions/reports"
import BrowseList from "@/components/browse-list"

export default async function BrowsePage() {
  const result = await listReports({ limit: 50 }); // Get the full result object

  // Extract data or default to an empty array if not successful or data is missing
  const initialReports = result.success && result.data ? result.data : []; 

  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-semibold text-balance">Browse nearby reports</h1>
      <BrowseList initialReports={initialReports} /> {/* Pass the processed array */}
    </main>
  )
}
