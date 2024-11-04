import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Upload, File, Users, ShoppingBag, Gift, X, ExternalLink } from 'lucide-react';

const KnowledgeBaseManagement = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedCustomers, setExpandedCustomers] = useState({});
  const [pdfs, setPdfs] = useState({});
  const [dragOver, setDragOver] = useState('');

  const products = [
    {
      name: 'Orochi V2',
      sections: ['Manual', 'Troubleshooting', 'Policies and Procedure'],
    },
    {
      name: 'SonyWH1000',
      sections: ['Manual', 'Troubleshooting', 'Policies and Procedure'],
    },
  ];

  const customers = [
    {
      name: 'Ankith Reddy',
      orders: ['Order #1234', 'Order #5678'],
      products: ['Orochi V2', 'SonyWH1000']
    },
    {
        name: 'Sruthi Sivasankar',
        orders: ['Order #4321', 'Order #8765'],
        products: ['Orochi V2', 'SonyWH1000']
      },
  ];

  const orders = ['Order #1234', 'Order #5678'];
  const newReleases = ['Airpod Max 2', 'MacBook Air M4'];

  const handleDragOver = (e, product, section) => {
    e.preventDefault();
    setDragOver(`${product}-${section}`);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver('');
  };

  const handleDrop = async (e, product, section) => {
    e.preventDefault();
    setDragOver('');
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );

    if (files.length === 0) {
      alert('Please drop PDF files only');
      return;
    }

    const newPdfs = { ...pdfs };
    const key = `${product}-${section}`;
    
    if (!newPdfs[key]) {
      newPdfs[key] = [];
    }

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const pdfData = {
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          lastModified: file.lastModified
        };
        
        newPdfs[key] = [...(newPdfs[key] || []), pdfData];
        setPdfs({ ...newPdfs });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePdf = (product, section, pdfName) => {
    const key = `${product}-${section}`;
    const newPdfs = { ...pdfs };
    newPdfs[key] = newPdfs[key].filter(pdf => pdf.name !== pdfName);
    setPdfs(newPdfs);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleProduct = (product) => {
    setExpandedProducts(prev => ({
      ...prev,
      [product]: !prev[product]
    }));
  };

  const toggleCustomer = (customer) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customer]: !prev[customer]
    }));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Knowledge Base Management</h2>
      
      {/* Products Section */}
      <div className="mb-6">
        <div 
          className="flex items-center gap-2 cursor-pointer p-2 bg-gray-100 rounded-md"
          onClick={() => toggleSection('products')}
        >
          {expandedSections.products ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <File size={20} />
          <span className="font-semibold">Products</span>
        </div>
        
        {expandedSections.products && (
          <div className="ml-8 mt-2">
            {products.map(product => (
              <div key={product.name} className="mb-2">
                <div 
                  className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                  onClick={() => toggleProduct(product.name)}
                >
                  {expandedProducts[product.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span>{product.name}</span>
                </div>
                
                {expandedProducts[product.name] && (
                  <div className="ml-8">
                    {product.sections.map(section => (
                      <div key={section} className="mb-4">
                        <div className="font-medium mb-2">{section}</div>
                        <div 
                          className={`p-4 border-2 border-dashed rounded-lg transition-colors ${
                            dragOver === `${product.name}-${section}` 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300'
                          }`}
                          onDragOver={(e) => handleDragOver(e, product.name, section)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, product.name, section)}
                        >
                          <div className="flex items-center justify-center gap-2 text-gray-500">
                            <Upload size={20} />
                            <span>Drag and drop PDFs here</span>
                          </div>
                        </div>

                        {/* PDF List */}
                        {pdfs[`${product.name}-${section}`]?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {pdfs[`${product.name}-${section}`].map((pdf, index) => (
                              <div 
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <File size={20} className="text-red-500" />
                                  <div>
                                    <div className="font-medium">{pdf.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {formatFileSize(pdf.size)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => window.open(pdf.url, '_blank')}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    title="Open PDF"
                                  >
                                    <ExternalLink size={16} />
                                  </button>
                                  <button
                                    onClick={() => removePdf(product.name, section, pdf.name)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    title="Remove PDF"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customers Section */}
      <div className="mb-6">
        <div 
          className="flex items-center gap-2 cursor-pointer p-2 bg-gray-100 rounded-md"
          onClick={() => toggleSection('customers')}
        >
          {expandedSections.customers ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <Users size={20} />
          <span className="font-semibold">Customers</span>
        </div>
        
        {expandedSections.customers && (
          <div className="ml-8 mt-2">
            {customers.map(customer => (
              <div key={customer.name} className="mb-2">
                <div 
                  className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                  onClick={() => toggleCustomer(customer.name)}
                >
                  {expandedCustomers[customer.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span>{customer.name}</span>
                </div>
                
                {expandedCustomers[customer.name] && (
                  <div className="ml-8">
                    <div className="mb-2">
                      <div className="font-medium mb-1">Orders:</div>
                      <ul className="list-disc ml-4">
                        {customer.orders.map(order => (
                          <li key={order}>{order}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Products:</div>
                      <ul className="list-disc ml-4">
                        {customer.products.map(product => (
                          <li key={product}>{product}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="mb-6">
        <div 
          className="flex items-center gap-2 cursor-pointer p-2 bg-gray-100 rounded-md"
          onClick={() => toggleSection('orders')}
        >
          {expandedSections.orders ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <ShoppingBag size={20} />
          <span className="font-semibold">Orders</span>
        </div>
        
        {expandedSections.orders && (
          <div className="ml-8 mt-2">
            {orders.map(order => (
              <div key={order} className="p-2 hover:bg-gray-50 rounded">
                {order}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Releases Section */}
      <div className="mb-6">
        <div 
          className="flex items-center gap-2 cursor-pointer p-2 bg-gray-100 rounded-md"
          onClick={() => toggleSection('newReleases')}
        >
          {expandedSections.newReleases ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <Gift size={20} />
          <span className="font-semibold">New Releases</span>
        </div>
        
        {expandedSections.newReleases && (
          <div className="ml-8 mt-2">
            {newReleases.map(release => (
              <div key={release} className="p-2 hover:bg-gray-50 rounded">
                {release}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseManagement;