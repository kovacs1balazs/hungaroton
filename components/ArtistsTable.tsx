"use client";

import { Box, Avatar, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchArtists, Artist, FetchArtistsResponse } from "@/utils/api";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function ArtistsTable() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [rows, setRows] = useState<Artist[]>([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Filters from URL
    const page = parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search") || "";
    const letter = searchParams.get("letter") || "";
    const type = (searchParams.get("type") || "") as "is_composer" | "is_performer" | "is_primary" | "";

    // Fetch data
    useEffect(() => {
        setLoading(true);
        fetchArtists({ page, per_page: 50, search, letter, type: type || undefined })
            .then((data: FetchArtistsResponse) => {
                setRows(
                    (data.data || []).map((artist) => ({
                        id: artist.id,
                        name: artist.name,
                        albumCount: artist.albumCount,
                        portrait: artist.portrait,
                    }))
                );
                setRowCount(data.pagination?.total_items || 0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, search, letter, type]);

    // Columns for DataGrid
    const columns: GridColDef[] = [
        {
            field: "portrait",
            headerName: "Kép",
            width: 80,
            renderCell: (params) => (params.value ? <Avatar src={params.value} alt={params.row.name} /> : null),
            sortable: false,
            filterable: false,
        },
        { field: "name", headerName: "Név", flex: 1 },
        { field: "albumCount", headerName: "Albumok", width: 150, type: "number" },
    ];

    // Update URL params helper
    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) params.delete(key);
            else params.set(key, value);
        });
        router.push("?" + params.toString());
    };

    return (
        <Box>
            {/* Filters */}
            <Box display="flex" flexDirection='column' flexWrap="wrap" gap={2} mb={2} alignItems="start">
                <Box display="flex" gap={2}>
                    <TextField
                        sx={{
                            minWidth: '200px', bgcolor: 'white',
                            '& .MuiOutlinedInput-root': {
                                '&.Mui-focused fieldset': {
                                    borderColor: 'black',
                                },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: 'black',
                            },
                        }}
                        label="Keresés"
                        size="small"
                        defaultValue={search}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") updateParams({ search: (e.target as HTMLInputElement).value, page: "1" });
                        }}
                    />
                    <Button sx={{ backgroundColor: 'black' }} variant="contained" onClick={() => {
                        const input = document.querySelector<HTMLInputElement>('input[label="Keresés"]');
                        if (input) updateParams({ search: input.value, page: "1" });
                    }}>Keresés</Button>
                </Box>


                {/* Type dropdown */}
                <FormControl size="small">
                    <InputLabel sx={{
                        '&.Mui-focused': {
                            color: 'black',
                        },
                    }}>Típus</InputLabel>
                    <Select
                        sx={{
                            minWidth: '200px', bgcolor: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'gray',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'black',
                            },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    '& .MuiMenuItem-root.Mui-selected': {
                                        bgcolor: '#e0eae0',
                                        color: 'black',
                                    },
                                },
                            },
                        }}
                        value={type || ""}
                        label="Type"
                        onChange={(e) => updateParams({ type: e.target.value || null, page: "1" })}
                    >
                        <MenuItem value="">Összes</MenuItem>
                        <MenuItem value="is_composer">Szerző</MenuItem>
                        <MenuItem value="is_performer">Előadó</MenuItem>
                        <MenuItem value="is_primary">Elsődleges</MenuItem>
                    </Select>
                </FormControl>

                {/* Letter filter */}
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {LETTERS.map((l) => (
                        <Button
                            sx={{ color: 'black', borderColor: 'black', bgcolor: 'white' }}
                            key={l}
                            size="small"
                            variant={letter === l ? "contained" : "outlined"}
                            onClick={() => updateParams({ letter: l, page: "1" })}
                        >
                            {l}
                        </Button>
                    ))}
                    {letter && (
                        <Button sx={{ fontSize: '10px', textTransform: 'capitalize', color: 'black' }} size="small" variant="text" onClick={() => updateParams({ letter: null, page: "1" })}>
                            Törlés
                        </Button>
                    )}
                </Box>
            </Box>

            {/* DataGrid */}
            <DataGrid
                rows={rows}
                columns={columns}
                rowCount={rowCount}
                pageSizeOptions={[50]}
                paginationMode="server"
                paginationModel={{ page: page - 1, pageSize: 50 }}
                onPaginationModelChange={(model) => {
                    updateParams({ page: (model.page + 1).toString() });
                }}
                loading={loading}
                sx={{
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: 'black',
                    },
                    '& .MuiLinearProgress-root': {
                        backgroundColor: '#ccc',
                    },
                }}
            />
        </Box>
    );
}
