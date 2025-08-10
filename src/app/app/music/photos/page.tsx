'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@prisma/client';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MusicianImage {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  dimensions?: string;
  tags?: string;
  location?: string;
  eventDate?: string;
  isActive: boolean;
  isPublic: boolean;
  isApproved: boolean;
  createdAt: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
  event?: {
    title: string;
    date: string;
  };
}

export default function MusicPhotosPage() {
  const { userRole, churchName, firstName, lastName } = useUserData();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<MusicianImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<MusicianImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<MusicianImage | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, searchTerm, selectedTags]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/multimedia/images');
      
      if (response.ok) {
        const imagesData = await response.json();
        setImages(imagesData);
      } else {
        console.error('Erreur lors du chargement des images');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterImages = () => {
    let filtered = images.filter(image => 
      image.isActive && image.isPublic && image.isApproved
    );

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(image => {
        if (!image.tags) return false;
        const imageTags = image.tags.split(',').map(tag => tag.trim().toLowerCase());
        return selectedTags.some(selectedTag => 
          imageTags.includes(selectedTag.toLowerCase())
        );
      });
    }

    setFilteredImages(filtered);
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    images.forEach(image => {
      if (image.tags) {
        image.tags.split(',').forEach(tag => {
          allTags.add(tag.trim());
        });
      }
    });
    return Array.from(allTags).sort();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const downloadImage = async (image: MusicianImage) => {
    try {
      const response = await fetch(image.fileUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement de l\'image');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openImageModal = (image: MusicianImage) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  return (
    <RoleGuard allowedRoles={[UserRole.MUSICIEN, UserRole.TECHNICIEN, UserRole.CHEF_LOUANGE, UserRole.ADMIN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <PhotoIcon className="h-8 w-8 mr-3 text-purple-600" />
              Photos des Musiciens
            </h1>
            <p className="text-gray-600 mt-2">
              Découvrez et téléchargez les photos de nos événements musicaux
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder="Rechercher par titre, description, lieu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tags Filter */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">Filtres :</span>
                <div className="flex flex-wrap gap-2">
                  {getAllTags().slice(0, 5).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Images Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredImages.length === 0 ? (
          <Card className="p-8 text-center">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {images.length === 0 ? 'Aucune photo disponible' : 'Aucune photo ne correspond à vos critères'}
            </p>
            <p className="text-gray-400 mt-2">
              {images.length === 0 
                ? 'L\'équipe multimédia n\'a pas encore déposé de photos.'
                : 'Essayez de modifier vos filtres de recherche.'
              }
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video bg-gray-100 relative cursor-pointer">
                  <img
                    src={image.fileUrl}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onClick={() => openImageModal(image)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{image.title}</h3>
                  {image.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.description}</p>
                  )}
                  
                  <div className="space-y-1 text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {new Date(image.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    {image.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {image.location}
                      </div>
                    )}
                    <div>{formatFileSize(image.fileSize)}</div>
                  </div>

                  {image.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {image.tags.split(',').slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full flex items-center"
                        >
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag.trim()}
                        </span>
                      ))}
                      {image.tags.split(',').length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          +{image.tags.split(',').length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Par {image.uploadedBy.firstName} {image.uploadedBy.lastName}
                    </span>
                    <Button
                      onClick={() => downloadImage(image)}
                      variant="outline"
                      size="sm"
                      className="text-purple-700 border-purple-300 hover:bg-purple-50"
                    >
                      <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {showModal && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedImage.title}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage.fileUrl}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
                <div className="mt-4 space-y-2">
                  {selectedImage.description && (
                    <p className="text-gray-600">{selectedImage.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.tags?.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-gray-500">
                      <p>Par {selectedImage.uploadedBy.firstName} {selectedImage.uploadedBy.lastName}</p>
                      <p>{new Date(selectedImage.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <Button
                      onClick={() => downloadImage(selectedImage)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
