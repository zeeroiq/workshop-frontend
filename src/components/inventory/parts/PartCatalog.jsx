import React, { useState, useMemo } from 'react';
import { catalogService } from '@/services/catalogService';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';

const PartCatalog = ({ onPartSelect }) => {
  const [showModels, setShowModels] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelName, setModelName] = useState('');
  const [parts, setParts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [filters, setFilters] = useState({
    partNo: '',
    description: '',
    plateTitle: '',
  });

  const handleListModels = async () => {
    if (!showModels) {
      try {
        const response = await catalogService.getSpcModels();
        if (response.data.success) {
          setModels(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    }
    setShowModels(!showModels);
  };

  const handleModelChange = (modelCode) => {
    setSelectedModel(modelCode);
    const model = models.find(m => m.modelCode === modelCode);
    if (model) {
      setModelName(model.modelName);
    }
  };

  const handleLoadParts = async () => {
    if (!selectedModel) return;
    try {
      const response = await catalogService.getSpcCatalogParts(selectedModel);
      if (response.data.success) {
        setParts(response.data.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  };

  const handleSelectPart = (part) => {
    setSelectedPart(part);
  };

  const handleLoadSelectedPart = () => {
    if (selectedPart) {
      onPartSelect({
        partNo: selectedPart.partNo,
        name: selectedPart.description,
        description: `${selectedPart.plateTitle} - ${selectedPart.description}\n${selectedPart.model}`,
      });
      setIsModalOpen(false);
      setShowModels(false);
      setSelectedPart(null);
      setSelectedModel('');
      setModelName('');
      setFilters({ partNo: '', description: '', plateTitle: '' });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredParts = useMemo(() => {
    let filtered = parts;
    if (filters.partNo) {
      filtered = filtered.filter(part =>
        (part.partNo || '').toLowerCase().includes(filters.partNo.toLowerCase())
      );
    }
    if (filters.description) {
      filtered = filtered.filter(part =>
        (part.description || '').toLowerCase().includes(filters.description.toLowerCase())
      );
    }
    if (filters.plateTitle) {
      filtered = filtered.filter(part =>
        (part.plateTitle || '').toLowerCase().includes(filters.plateTitle.toLowerCase())
      );
    }
    return filtered;
  }, [parts, filters]);

  return (
    <div className="my-4">
      <div className="flex justify-end">
        <Button onClick={handleListModels}>
          {showModels ? 'Hide Available Models' : 'Add Part from Available List'}
        </Button>
      </div>

      {showModels && (
        <div className="flex items-center space-x-2 mt-4">
          <Select onValueChange={handleModelChange} value={selectedModel}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 dark:text-white">
              {models.map((model) => (
                <SelectItem key={model.modelCode} value={model.modelCode} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  {model.modelCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="text" value={modelName} placeholder="Model Name" disabled className="bg-gray-100 dark:bg-gray-800 dark:text-gray-400" />
          <Button onClick={handleLoadParts} disabled={!selectedModel}>
            Load Parts
          </Button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Parts for ${modelName}`}>
        <div className="max-h-96 overflow-y-auto">
          <Table className="table-fixed w-full text-foreground">
            <TableHeader>
              <TableRow className="border-b dark:border-gray-700">
                <TableHead style={{ width: '5%' }}></TableHead>
                <TableHead style={{ width: '25%' }}>Part No</TableHead>
                <TableHead style={{ width: '40%' }}>Description</TableHead>
                <TableHead style={{ width: '30%' }}>Plate Title</TableHead>
              </TableRow>
              <TableRow className="border-b dark:border-gray-700">
                <TableCell></TableCell>
                <TableCell>
                  <Input name="partNo" value={filters.partNo} onChange={handleFilterChange} className="h-8 bg-white dark:bg-gray-800 dark:text-white" />
                </TableCell>
                <TableCell>
                  <Input name="description" value={filters.description} onChange={handleFilterChange} className="h-8 bg-white dark:bg-gray-800 dark:text-white" />
                </TableCell>
                <TableCell>
                  <Input name="plateTitle" value={filters.plateTitle} onChange={handleFilterChange} className="h-8 bg-white dark:bg-gray-800 dark:text-white" />
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part, index) => (
                <TableRow key={`${part.partNo}-${part.no}-${index}`} className="border-b dark:border-gray-700">
                  <TableCell>
                    <input
                      type="radio"
                      name="part"
                      onChange={() => handleSelectPart(part)}
                      className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    />
                  </TableCell>
                  <TableCell>{part.partNo}</TableCell>
                  <TableCell>{part.description}</TableCell>
                  <TableCell>{part.plateTitle}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleLoadSelectedPart} disabled={!selectedPart}>
            Load
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PartCatalog;

