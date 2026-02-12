import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldTripCard } from "@/components/FieldTripCard";
import { RegistrationModal } from "@/components/RegistrationModal";
import { fetchFieldTrips } from "@/services/api";
import type { FieldTrip } from "@/types";

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; fieldTrip: FieldTrip | null };

function App() {
  const [pageState, setPageState] = useState<PageState>({ status: "loading" });
  const [modalOpen, setModalOpen] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  const schoolId =
    new URLSearchParams(window.location.search).get("schoolId") ?? "";

  useEffect(() => {
    let cancelled = false;

    fetchFieldTrips()
      .then((trips) => {
        if (!cancelled) {
          setPageState({ status: "success", fieldTrip: trips[0] ?? null });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setPageState({ status: "error", message: err.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  function handleRetry() {
    setPageState({ status: "loading" });
    setFetchKey((k) => k + 1);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {pageState.status === "loading" && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading field trip details...
          </p>
        </div>
      )}

      {pageState.status === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-destructive">{pageState.message}</p>
          <Button variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      )}

      {pageState.status === "success" && pageState.fieldTrip && (
        <>
          <FieldTripCard
            fieldTrip={pageState.fieldTrip}
            onRegister={() => setModalOpen(true)}
          />
          <RegistrationModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            fieldTrip={pageState.fieldTrip}
            schoolId={schoolId}
          />
        </>
      )}

      {pageState.status === "success" && !pageState.fieldTrip && (
        <p className="text-muted-foreground">
          No field trips available at this time.
        </p>
      )}
    </div>
  );
}

export default App;
