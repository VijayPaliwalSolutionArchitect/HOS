import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit, Trash2, Save, X, FolderTree, Tag, ChevronRight,
  Check, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import DashboardLayout from '../../components/DashboardLayout';
import { categoriesAPI } from '../../lib/api';
import { toast } from 'sonner';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    parent_id: null,
    order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll(true);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await categoriesAPI.create(formData);
      toast.success('Category created successfully!');
      setIsCreating(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error(error.response?.data?.detail || 'Failed to create category');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await categoriesAPI.update(editingId, formData);
      toast.success('Category updated successfully!');
      setEditingId(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return;
    }

    try {
      // Note: Backend does soft delete (deactivation)
      await categoriesAPI.update(categoryId, { is_active: false });
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      parent_id: category.parent_id || null,
      order: category.order || 0
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      parent_id: null,
      order: 0
    });
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const renderCategoryForm = (onSubmit, isEdit = false) => (
    <form onSubmit={onSubmit} className="space-y-4 p-4 bg-muted/50 rounded-lg border-2 border-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            placeholder="e.g., Mathematics"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            placeholder="e.g., mathematics"
            pattern="[a-z0-9-]+"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="📐"
            maxLength={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Parent Category</label>
          <select
            value={formData.parent_id || ''}
            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">None (Root Category)</option>
            {categories
              .filter(cat => !cat.parent_id && cat.is_active && cat.id !== editingId)
              .map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Order</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            rows="2"
            placeholder="Brief description of the category"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          {isEdit ? 'Update' : 'Create'} Category
        </Button>
        <Button type="button" variant="outline" onClick={cancelEdit}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );

  const renderCategoryTree = () => {
    const parentCategories = categories.filter(cat => !cat.parent_id && cat.is_active);
    
    return parentCategories.map(parent => {
      const children = categories.filter(cat => cat.parent_id === parent.id && cat.is_active);
      
      return (
        <div key={parent.id} className="mb-4">
          {editingId === parent.id ? (
            renderCategoryForm(handleUpdate, true)
          ) : (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{parent.icon || '📁'}</span>
                    <div>
                      <h3 className="text-lg font-semibold">{parent.name}</h3>
                      {parent.description && (
                        <p className="text-sm text-muted-foreground">{parent.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {parent.slug}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Order: {parent.order}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(parent)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(parent.id, parent.name)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {children.length > 0 && (
                  <div className="ml-8 mt-4 space-y-2 border-l-2 border-border pl-4">
                    {children.map(child => (
                      <div key={child.id}>
                        {editingId === child.id ? (
                          renderCategoryForm(handleUpdate, true)
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              <span className="text-lg">{child.icon || '📄'}</span>
                              <div>
                                <p className="font-medium">{child.name}</p>
                                {child.description && (
                                  <p className="text-xs text-muted-foreground">{child.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {child.slug}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Order: {child.order}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(child)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(child.id, child.name)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 font-outfit">Categories</h1>
            <p className="text-muted-foreground">
              Manage exam and course categories with hierarchical organization
            </p>
          </div>
          {!isCreating && !editingId && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Categories</p>
                <p className="text-3xl font-bold">{categories.filter(c => c.is_active).length}</p>
              </div>
              <FolderTree className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Parent Categories</p>
                <p className="text-3xl font-bold">
                  {categories.filter(c => !c.parent_id && c.is_active).length}
                </p>
              </div>
              <Tag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subcategories</p>
                <p className="text-3xl font-bold">
                  {categories.filter(c => c.parent_id && c.is_active).length}
                </p>
              </div>
              <ChevronRight className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
          {renderCategoryForm(handleCreate)}
        </div>
      )}

      {/* Categories Tree */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Category Hierarchy</h2>
        {categories.filter(c => c.is_active).length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first category to get started
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </Card>
        ) : (
          renderCategoryTree()
        )}
      </div>
    </DashboardLayout>
  );
};

export default Categories;
