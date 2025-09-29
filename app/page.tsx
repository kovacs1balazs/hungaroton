import ArtistsTable from "@/components/ArtistsTable";
import { Container, Typography } from "@mui/material";

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