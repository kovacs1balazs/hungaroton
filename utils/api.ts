export interface Artist  {
  id: number;
  name: string;
  albumCount: number;
  portrait?: string;
};

export interface Pagination {

  current_page: number,
  total_pages: number,
  per_page: number,
  total_items: number;
}


export type FetchArtistsParams = {
  page?: number;
  per_page?: number;
  search?: string;
  letter?: string;
  type?: "is_composer" | "is_performer" | "is_primary";
};

export type FetchArtistsResponse = {
  data: Artist[];
  pagination: Pagination;
};

export async function fetchArtists(params: FetchArtistsParams): Promise<FetchArtistsResponse> {
  const query = new URLSearchParams({
    include_image: "true",
    page: (params.page || 1).toString(),
    per_page: (params.per_page || 50).toString(),
  });

  if (params.search) query.set("search", params.search);
  if (params.letter) query.set("letter", params.letter);
  if (params.type) query.set("type", params.type);

  const res = await fetch(`https://exam.api.fotex.net/api/artists?${query.toString()}`, { cache: "no-store" });

  if (!res.ok) throw new Error("API error");

  return res.json();
}
