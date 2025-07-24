"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ExternalLink, MessageCircle, Calendar, MapPin, Search, Filter } from "lucide-react"


const cities = ["All Cities", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"]
const categories = [
  "All Categories",
  "Tax",
  "Utilities",
  "Infrastructure",
  "Welfare",
  "Business",
  "Health",
  "Education",
]

export default function CircularsPage() {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [circulars, setCirculars] = useState<any[]>([]);
  const [filteredCirculars, setFilteredCirculars] = useState<any[]>([]);

  useEffect(() => {
    const fetchCirculars = async () => {
      const response = await fetch("/api/circulars");
      const data = await response.json();
      setCirculars(data.data);
      setFilteredCirculars(data.data);
    };
    fetchCirculars();
  }, []);

  const handleAskAboutCircular = (circular: any) => {
    console.log("Ask about circular:", circular.title)
    // This would redirect to chat with pre-filled context
    window.location.href = `/chat?context=${encodeURIComponent(circular.title)}`
  }

  const filterCirculars = () => {
    let filtered = circulars;

    if (selectedCity !== "All Cities") {
      filtered = filtered.filter((circular) => circular.city === selectedCity);
    }

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((circular) => circular.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (circular) =>
          circular.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          circular.summary.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredCirculars(filtered)
  }

  useEffect(() => {
    filterCirculars();
  }, [selectedCity, selectedCategory, searchQuery, circulars]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Government Circulars</h1>
          <p className="text-gray-600">Latest official notices and updates from government sources</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search circulars..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    filterCirculars()
                  }}
                  className="pl-10"
                />
              </div>

              <Select
                value={selectedCity}
                onValueChange={(value) => {
                  setSelectedCity(value)
                  filterCirculars()
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{city}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value)
                  filterCirculars()
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4" />
                        <span>{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={filterCirculars} className="bg-indigo-600 hover:bg-indigo-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredCirculars.length} circular{filteredCirculars.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select defaultValue="date">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Latest</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="city">City</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Circulars Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCirculars.map((circular) => (
            <Card key={circular.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge className={getPriorityColor(circular.priority)}>{circular.priority.toUpperCase()}</Badge>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{circular.date}</span>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">{circular.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{circular.city}</Badge>
                  <Badge variant="outline">{circular.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">{circular.summary}</p>

                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Source:</span> {circular.source}
                  </p>

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(circular.sourceLink, "_blank")}
                      className="justify-start"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Original
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleAskAboutCircular(circular)}
                      className="justify-start bg-indigo-600 hover:bg-indigo-700"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask me about this
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCirculars.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">No circulars found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or filters</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCity("All Cities");
                    setSelectedCategory("All Categories");
                    setSearchQuery("");
                    setFilteredCirculars(circulars);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
