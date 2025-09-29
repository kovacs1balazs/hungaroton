"use client";

import dynamic from "next/dynamic";
import { Container, Typography } from "@mui/material";

const ArtistsTable = dynamic(() => import("@/components/ArtistsTable"), { ssr: false });


export default function Page() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{mb: "40px", fontWeight: 700 }}>
        Hungaroton Artists
      </Typography>
      <ArtistsTable />
    </Container>
  );
}