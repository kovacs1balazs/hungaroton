export interface Artist  {
  id: string;
  name: string;
  albumCount: number;
  portrait?: string;
};

export async function fetchArtists(params: {
  page?: number;
  search?: string;
  per_page?: number;
}) {
  const query = new URLSearchParams({
    include_image: "true",
    per_page: (params.per_page || 50).toString(),
    page: (params.page || 1).toString(),
  });

  if (params.search) {
    query.set("search", params.search);
  }

  const res = await fetch(`https://exam.api.fotex.net/api/artists?${query}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
}