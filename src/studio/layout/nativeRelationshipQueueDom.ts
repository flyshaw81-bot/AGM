export function queryDirectRelationshipQueueDom() {
  const nativeRelationshipQueueRoot = document.querySelector<HTMLElement>(
    "[data-direct-relationship-queue='true']",
  );
  const nativeRelationshipQueueReview = document.querySelector<HTMLElement>(
    "[data-direct-relationship-queue-review='true']",
  );
  const nativeRelationshipQueueActionScope =
    document.querySelector<HTMLElement>(
      "[data-direct-relationship-queue-action-scope='true']",
    );
  const nativeRelationshipQueueSummary = document.querySelector<HTMLElement>(
    "[data-direct-relationship-queue-summary='true']",
  );
  const nativeRelationshipQueueHistory = document.querySelector<HTMLElement>(
    "[data-direct-relationship-queue-history='true']",
  );
  const nativeRelationshipQueueHistoryText =
    document.querySelector<HTMLElement>(
      "[data-direct-relationship-queue-history-text='true']",
    );
  const nativeRelationshipQueueHistoryReview =
    document.querySelector<HTMLButtonElement>(
      "[data-studio-action='direct-relationship-history-review']",
    );
  const nativeRelationshipQueueHistoryUndo =
    document.querySelector<HTMLButtonElement>(
      "[data-studio-action='direct-relationship-history-undo']",
    );
  const nativeRelationshipQueueHistoryFilters =
    document.querySelector<HTMLElement>(
      "[data-direct-relationship-history-filters='true']",
    );
  const nativeRelationshipQueueHistoryFilterSummary =
    document.querySelector<HTMLElement>(
      "[data-direct-relationship-history-filter-summary='true']",
    );
  const nativeRelationshipQueueHistoryFilterEmpty =
    document.querySelector<HTMLElement>(
      "[data-direct-relationship-history-filter-empty='true']",
    );
  const nativeRelationshipQueueHistoryList =
    document.querySelector<HTMLElement>(
      "[data-direct-relationship-history-list='true']",
    );
  const nativeRelationshipQueueList = document.querySelector<HTMLElement>(
    "[data-direct-relationship-queue-list='true']",
  );
  const nativeRelationshipQueueDetails = document.querySelector<HTMLElement>(
    "[data-direct-relationship-queue-details='true']",
  );
  const nativeRelationshipQueueToggle =
    document.querySelector<HTMLButtonElement>(
      "[data-studio-action='direct-relationship-queue-toggle']",
    );
  const nativeRelationshipQueueCount = document.querySelector<HTMLElement>(
    "[data-direct-relationship-queue-count='true']",
  );
  const nativeRelationshipQueueApply =
    document.querySelector<HTMLButtonElement>(
      "[data-studio-action='direct-relationship-queue-apply']",
    );

  return {
    nativeRelationshipQueueActionScope,
    nativeRelationshipQueueApply,
    nativeRelationshipQueueCount,
    nativeRelationshipQueueDetails,
    nativeRelationshipQueueHistory,
    nativeRelationshipQueueHistoryFilterEmpty,
    nativeRelationshipQueueHistoryFilterSummary,
    nativeRelationshipQueueHistoryFilters,
    nativeRelationshipQueueHistoryList,
    nativeRelationshipQueueHistoryReview,
    nativeRelationshipQueueHistoryText,
    nativeRelationshipQueueHistoryUndo,
    nativeRelationshipQueueList,
    nativeRelationshipQueueReview,
    nativeRelationshipQueueRoot,
    nativeRelationshipQueueSummary,
    nativeRelationshipQueueToggle,
  };
}

export function queryDirectRelationshipQueueHistoryDetails() {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-direct-relationship-history-detail='true']",
    ),
  );
}

export function queryDirectRelationshipQueueHistoryRows() {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-direct-relationship-history-row='true']",
    ),
  );
}

export const queryNativeRelationshipQueueDom = queryDirectRelationshipQueueDom;
export const queryNativeRelationshipQueueHistoryDetails =
  queryDirectRelationshipQueueHistoryDetails;
export const queryNativeRelationshipQueueHistoryRows =
  queryDirectRelationshipQueueHistoryRows;
