import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import 'primereact/resources/themes/saga-blue/theme.css'; 
import 'primereact/resources/primereact.min.css';        
import 'primeicons/primeicons.css';                      

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
}

const PAGE_SIZE = 12;

const App: React.FC = () => {
  const [data, setData] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [first, setFirst] = useState<number>(0);
  const [showInput, setShowInput] = useState<boolean>(false); 
  const [selectCount, setSelectCount] = useState<number>(1);  

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${PAGE_SIZE}`);
      const result = await response.json();
      setData(result.data);
      setTotalRecords(result.pagination.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: any) => {
    setCurrentPage(event.page + 1);  
    setFirst(event.first);
  };

  const onRowSelect = (e: any) => {
    setSelectedRows(e.value);
  };

  const handleSelectRows = async () => {
    let rowsToSelect = [...data.slice(0, selectCount)]; 
    let remainingCount = selectCount - rowsToSelect.length;

    if (remainingCount > 0) {
      let nextPage = currentPage + 1;
      while (remainingCount > 0 && nextPage <= Math.ceil(totalRecords / PAGE_SIZE)) {
        const nextPageData = await fetchNextPage(nextPage);
        const rowsFromNextPage = nextPageData.slice(0, remainingCount);
        rowsToSelect = [...rowsToSelect, ...rowsFromNextPage];
        remainingCount -= rowsFromNextPage.length;
        nextPage++;
      }
    }

    setSelectedRows(rowsToSelect);
  };

  const fetchNextPage = async (page: number) => {
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${PAGE_SIZE}`);
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching next page:", error);
      return [];
    }
  };

  const toggleInputField = () => {
    setShowInput(!showInput);
  };

  return (
    <div className="App">
      <div className="p-d-flex p-ai-center p-jc-between p-mb-4">
        <Button
          icon="pi pi-chevron-down"
          className="p-mr-2"
          onClick={toggleInputField}
        />
      </div>

      {showInput && (
        <div className="p-mb-4">
          <label htmlFor="selectCount">Number of rows to select: </label>
          <InputNumber
            id="selectCount"
            value={selectCount}
            onValueChange={(e) => setSelectCount(e.value || 0)}
            min={1}
            max={totalRecords}  
          />
          <Button label="Select Rows" onClick={handleSelectRows} />
        </div>
      )}

      <DataTable
        value={data}
        paginator
        rows={PAGE_SIZE}  
        totalRecords={totalRecords}
        lazy
        loading={loading}
        first={first}
        onPage={handlePageChange}
        selection={selectedRows}
        onSelectionChange={onRowSelect}
        selectionMode="multiple"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column field="title" header="Title" sortable />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist Display" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
};

export default App;
