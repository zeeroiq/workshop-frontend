import React, { useState, useMemo } from 'react';
import { catalogService } from '@/services/catalogService';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaSearch, FaCar, FaBarcode, FaInfoCircle } from 'react-icons/fa';
import { cn } from "@/lib/utils";

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
    <div className="my-6">
      <div className="flex justify-end">
        <Button onClick={handleListModels} variant={showModels ? "outline" : "default"} className="font-bold uppercase tracking-widest text-xs h-11 px-6">
          <FaCar className="mr-2 h-3 w-3" />
          {showModels ? 'Hide Intelligent Catalog' : 'Source from Catalog'}
        </Button>
      </div>

      {showModels && (
        <Card className="mt-4 border-emerald-500/20 bg-emerald-500/5 animate-in slide-in-from-top-4 duration-300">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 w-full space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Target Model Node</Label>
                        <Select onValueChange={handleModelChange} value={selectedModel}>
                            <SelectTrigger className="h-11 bg-background/50 font-bold border-emerald-500/20">
                            <SelectValue placeholder="Select Model Code" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                            {models.map((model) => (
                                <SelectItem key={model.modelCode} value={model.modelCode}>
                                    <span className="font-black mr-2">{model.modelCode}</span>
                                    <span className="opacity-50">• {model.modelName}</span>
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Descriptor</Label>
                        <Input type="text" value={modelName} placeholder="Model Name" disabled className="h-11 bg-muted/20 font-medium" />
                    </div>
                    <Button onClick={handleLoadParts} disabled={!selectedModel} className="h-11 w-full sm:w-auto font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/10">
                        Synthesize Parts
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Catalog Extract: ${modelName}`}
        className="max-w-4xl"
      >
        <div className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase tracking-widest opacity-50">Filter Part #</Label>
                    <div className="relative">
                        <FaBarcode className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground opacity-30" />
                        <Input name="partNo" value={filters.partNo} onChange={handleFilterChange} className="h-8 pl-8 bg-muted/10 text-[10px] font-bold" />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase tracking-widest opacity-50">Filter Description</Label>
                    <div className="relative">
                        <FaSearch className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground opacity-30" />
                        <Input name="description" value={filters.description} onChange={handleFilterChange} className="h-8 pl-8 bg-muted/10 text-[10px] font-bold" />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-[8px] font-black uppercase tracking-widest opacity-50">Filter Plate</Label>
                    <div className="relative">
                        <FaInfoCircle className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground opacity-30" />
                        <Input name="plateTitle" value={filters.plateTitle} onChange={handleFilterChange} className="h-8 pl-8 bg-muted/10 text-[10px] font-bold" />
                    </div>
                </div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Desktop View */}
                <div className="hidden sm:block overflow-x-auto rounded-xl border border-border/50">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 w-10"></th>
                                <th className="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest opacity-60">Part #</th>
                                <th className="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest opacity-60">Description</th>
                                <th className="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest opacity-60">Plate Title</th>
                            </tr>
                        </TableHeader>
                        <TableBody>
                            {filteredParts.map((part, index) => (
                                <TableRow 
                                    key={index} 
                                    className={cn("hover:bg-primary/5 cursor-pointer transition-colors", selectedPart?.partNo === part.partNo && "bg-primary/10")}
                                    onClick={() => handleSelectPart(part)}
                                >
                                    <TableCell className="px-4 py-2">
                                        <input
                                            type="radio"
                                            name="part"
                                            checked={selectedPart?.partNo === part.partNo}
                                            onChange={() => handleSelectPart(part)}
                                            className="h-4 w-4 accent-emerald-500"
                                        />
                                    </TableCell>
                                    <TableCell className="px-4 py-2 font-black text-xs tracking-tighter uppercase">{part.partNo}</TableCell>
                                    <TableCell className="px-4 py-2 text-xs font-bold leading-snug">{part.description}</TableCell>
                                    <TableCell className="px-4 py-2 text-[10px] font-medium opacity-60 italic">{part.plateTitle}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View */}
                <div className="sm:hidden space-y-3">
                    {filteredParts.map((part, index) => (
                        <div 
                            key={index} 
                            onClick={() => handleSelectPart(part)}
                            className={cn(
                                "p-4 rounded-xl border transition-all active:scale-[0.98]",
                                selectedPart?.partNo === part.partNo ? "bg-primary/10 border-primary/50 shadow-inner" : "bg-muted/10 border-border/50"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">{part.partNo}</span>
                                <input type="radio" checked={selectedPart?.partNo === part.partNo} readOnly className="h-4 w-4 accent-emerald-500" />
                            </div>
                            <p className="text-sm font-bold leading-tight mb-2">{part.description}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{part.plateTitle}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Showing {filteredParts.length} matching resources
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 sm:flex-none h-10 px-6 font-bold uppercase tracking-widest text-xs">Cancel</Button>
                    <Button onClick={handleLoadSelectedPart} disabled={!selectedPart} className="flex-1 sm:flex-none h-10 px-8 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">Inject to Form</Button>
                </div>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartCatalog;
