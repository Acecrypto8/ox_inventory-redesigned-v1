import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inventory, Slot } from '../../typings';
import WeightBar from '../utils/WeightBar';
import InventorySlot from './InventorySlot';
import { getTotalWeight } from '../../helpers';
import { useAppSelector } from '../../store';
import { useIntersection } from '../../hooks/useIntersection';

interface InventoryGridProps {
  inventory: Inventory;
}

const PAGE_SIZE = 30;

const InventoryGrid: React.FC<InventoryGridProps> = ({ inventory }) => {
  const weight = useMemo(
    () =>
      inventory.maxWeight !== undefined
        ? Math.floor(getTotalWeight(inventory.items) * 1000) / 1000
        : 0,
    [inventory.maxWeight, inventory.items]
  );

  const [page, setPage] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref, entry } = useIntersection({ threshold: 0.5 });
  const isBusy = useAppSelector((state) => state.inventory.isBusy);

  // Slice items to paginate
  const visibleItems = inventory.items.slice(0, (page + 1) * PAGE_SIZE);

  // Check if we should split out the first 5 slots (only for player inventory)
  const shouldSplitFirstFive = inventory.type === 'player';

  // First 5 items (if split), else empty array
  const firstFiveItems = shouldSplitFirstFive ? visibleItems.slice(0, 5) : [];

  // Remaining items (or all if no split)
  const remainingItems = shouldSplitFirstFive ? visibleItems.slice(5) : visibleItems;

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      setPage((prev) => prev + 1);
    }
  }, [entry]);

  return (
    <div
      className="inventory-grid-wrapper"
      style={{ pointerEvents: isBusy ? 'none' : 'auto' }}
    >
<div className="ace-weight-bar">
  <div className="inventory-grid-header-wrapper">
    <div className="username-wrapper">
        <i className="fa-solid fa-circle-user"></i>
        <p>{inventory.label}</p>
    </div>
    {inventory.maxWeight && (
      <p className="ace-weight-bar-weight">
        {weight / 1000}/{inventory.maxWeight / 1000}kg
      </p>
    )}
  </div>
  <WeightBar
    percent={inventory.maxWeight ? (weight / inventory.maxWeight) * 100 : 0}
  />
</div>


      {/* Side-by-side container */}
      <div className="inventory-grid-side-by-side">
        {/* Left stacked first 5 slots */}
        {shouldSplitFirstFive && (
          <div className="inventory-grid-stacked">
            {firstFiveItems.map((item) => (
              <InventorySlot
                key={`first-${inventory.type}-${inventory.id}-${item.slot}`}
                item={item}
                inventoryType={inventory.type}
                inventoryGroups={inventory.groups}
                inventoryId={inventory.id}
              />
            ))}
          </div>
        )}

        {/* Right main grid for remaining slots */}
        <div className="inventory-grid-container" ref={containerRef}>
          {remainingItems.map((item, index) => (
            <InventorySlot
              key={`rest-${inventory.type}-${inventory.id}-${item.slot}`}
              item={item}
              ref={index === remainingItems.length - 1 ? ref : null}
              inventoryType={inventory.type}
              inventoryGroups={inventory.groups}
              inventoryId={inventory.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryGrid;
