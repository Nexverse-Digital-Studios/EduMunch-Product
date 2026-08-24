/**
 * Grievances Page
 * ================
 * Main page component that wraps the grievances list
 */

import { useState } from "react";
import { GrievancesList } from "./GrievancesList";
import { CreateGrievanceDialog } from "./CreateGrievanceDialog";

const GrievancesPage = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <GrievancesList onCreateNew={() => setShowCreateDialog(true)} />
      <CreateGrievanceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};

export default GrievancesPage;
