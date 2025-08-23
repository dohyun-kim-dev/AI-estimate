"use client";

import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import dayjs from "dayjs";

// Import GenericListUI and related types.
import GenericListUI, { FetchParams, FetchResult } from "./GenericListUI";
// Import ColumnDefinition type from GenericDataTable (needed for GenericListUI).
import { ColumnDefinition } from "./GenericDataTable";

/**
 * =======================================================================
 * GenericListUI Usage Guide Example
 * =======================================================================
 *
 * This file provides a basic usage example for the GenericListUI,
 * GenericDataTable, and GenericDateRangePicker components.
 * It uses Mock data instead of actual API integration to focus on
 * understanding the component structure and the usage of main props.
 */

// --- 1. Define Mock Data Type ---
// Define the type of data to be displayed in the list.
interface MockItem {
  id: number;
  name: string;
  category: string;
  registeredDate: string; // Date string in YYYY-MM-DD format
  status: "active" | "inactive" | "pending";
  amount: number;
}

// --- 2. Create Mock Data ---
// Create sample data to replace the actual API response.
const mockData: MockItem[] = Array.from({ length: 101 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
  category: i % 3 === 0 ? "Electronics" : i % 3 === 1 ? "Clothing" : "Books",
  registeredDate: dayjs()
    .subtract(Math.floor(Math.random() * 365), "day")
    .format("YYYY-MM-DD"),
  status: i % 4 === 0 ? "active" : i % 4 === 1 ? "inactive" : "pending",
  amount: Math.floor(Math.random() * 100000),
}));

// --- 3. Styled Component (Optional) ---
// You can define simple styled components to use in formatters, etc.
const StatusBadge = styled.span<{ status: MockItem["status"] }>`
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  background-color: ${({ status }) =>
    status === "active" ? "#4CAF50" : status === "inactive" ? "#f44336" : "#FF9800"};
`;

// --- 4. Define Guide Component ---
const GenericListGuide: React.FC = () => {
  /**
   * --- 5. Implement fetchData Function (Using Mock Data) ---
   *
   * GenericListUI fetches data via the fetchData prop.
   * This function takes FetchParams as an argument and must return a Promise of type FetchResult<T>.
   *
   * Currently, GenericListUI supports client-side pagination/sorting,
   * so this function is primarily used to return the *entire* filtered data (by date, search keyword).
   */
  const fetchData = useCallback(async (params: FetchParams): Promise<FetchResult<MockItem>> => {
    console.log("Mock fetchData called with params:", params);
    // Simulate asynchronous loading with setTimeout instead of an actual API call.
    await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms delay

    // Filter Mock Data (Date and Keyword)
    const filteredData = mockData.filter((item) => {
      let dateMatch = true;
      if (params.fromDate && params.toDate) {
        const itemDate = dayjs(item.registeredDate);
        dateMatch =
          itemDate.isAfter(dayjs(params.fromDate).subtract(1, "day")) &&
          itemDate.isBefore(dayjs(params.toDate).add(1, "day"));
      }

      let keywordMatch = true;
      if (params.keyword) {
        const lowerKeyword = params.keyword.toLowerCase();
        keywordMatch =
          item.name.toLowerCase().includes(lowerKeyword) || item.category.toLowerCase().includes(lowerKeyword);
      }

      return dateMatch && keywordMatch;
    });

    // Return the filtered result in FetchResult format.
    return {
      data: filteredData, // Entire filtered data
      totalItems: filteredData.length, // Number of filtered items
      allItems: mockData.length, // Total number of items before filtering
    };
  }, []); // The dependency array is empty as mockData does not change.

  /**
   * --- 6. Define Columns ---
   *
   * Define the column information to be displayed in GenericDataTable (used internally by GenericListUI).
   * It is an array of type ColumnDefinition<T>.
   *
   * - header: String to be displayed in the table header.
   * - accessor: Key to get the cell value from the data object (nested access with dot (.) is possible).
   * - sortable: Whether sorting by this column is possible (client-side sorting).
   * - formatter: Function to custom render cell content (returns ReactNode).
   *   - value: Original value obtained via accessor.
   *   - item: The entire data object for the row.
   *   - rowIndex: The index of the row.
   */
  const columns = useMemo(
    (): ColumnDefinition<MockItem>[] => [
      // 6-1. Basic Columns (String, Sortable)
      { header: "ID", accessor: "id", sortable: true },
      { header: "Name", accessor: "name", sortable: true },
      { header: "Category", accessor: "category", sortable: true },

      // 6-2. Date Formatting Column (Sortable)
      {
        header: "Registered Date",
        accessor: "registeredDate",
        sortable: true,
        formatter: (value: string) => dayjs(value).format("YYYY-MM-DD"), // Simple formatting using dayjs
      },

      // 6-3. Status Formatting Column (Using Styled Component, Sortable)
      {
        header: "Status",
        accessor: "status",
        sortable: true,
        formatter: (value: MockItem["status"]) => <StatusBadge status={value}>{value.toUpperCase()}</StatusBadge>, // Use StatusBadge defined above
      },

      // 6-4. Number Formatting Column (Sortable)
      {
        header: "Amount",
        accessor: "amount",
        sortable: true,
        formatter: (value: number) => `${value.toLocaleString()} KRW`, // Format number as currency
      },
    ],
    [] // The dependency array is empty as column definitions are usually set only once.
  );

  /**
   * --- 7. Render GenericListUI ---
   *
   * Render the GenericListUI component by passing the necessary props.
   */
  return (
    <GenericListUI<MockItem>
      // --- Required Props ---
      title="Mock Data List Example" // Title to be displayed at the top of the list (ReactNode possible)
      columns={columns} // Column information array defined above
      fetchData={fetchData} // Data loading function defined above
      excelFileName="MockDataExport" // File name to be used for Excel download (extension excluded)
      // --- Optional Props ---

      // Initial state settings (page, size, sort, etc.)
      // Affects mainly the initial display state due to enhanced client-side processing.
      initialState={{
        page: 1, // Initial page number
        size: 10, // Initial items per page
        sortKey: "id", // Initial sort column accessor
        sortOrder: "desc", // Initial sort order ('asc' or 'desc')
        // fromDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'), // Initial start date (default: 6 months ago)
        // toDate: dayjs().format('YYYY-MM-DD'), // Initial end date (default: today)
        // keyword: "Item", // Initial search keyword
      }}
      // Function to extract unique key for each row (default: item.id or item.index)
      // keyExtractor={(item) => item.id}

      // Enable search feature (default: true)
      enableSearch={true}
      // Search input placeholder text
      searchPlaceholder="Search by name or category"
      // Enable date filter (default: true)
      // GenericDateRangePicker component is built-in and used.
      enableDateFilter={true}
      // Date range quick selection button options (default: ['6 months', '1 year', '2 years'])
      // dateRangeOptions={["1 month", "3 months", "6 months"]}

      // Items per page selection options (default: [12, 30, 50, 100])
      itemsPerPageOptions={[10, 20, 30, 50]}
      // Theme mode ('light' or 'dark', default: 'light')
      themeMode="light"
      // Callback function to execute on row click
      onRowClick={(item, rowIndex) => {
        alert(`Row ${rowIndex + 1} clicked! Name: ${item.name}`);
      }}
      // Function to render additional action buttons on the right side of the header
      renderHeaderActionButton={() => (
        <button
          onClick={() => alert("Additional action button clicked!")}
          style={{ padding: "8px 16px", borderRadius: "0px", border: "none", background: "#214A72", color: "white" }}>
          Additional Action
        </button>
      )}
      // Function to render the tab area (if needed)
      // renderTabs={() => <div>Tab Area</div>}

      // Message to display when there is no data (default: 'No data available.')
      // noDataMessage="No Mock data to display."

      // Custom component to display when there is no data (overrides noDataMessage)
      // noDataComponent={<div>It's empty!</div>}
    />
  );
};

export default GenericListGuide;
