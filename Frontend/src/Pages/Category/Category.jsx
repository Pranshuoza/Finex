import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/category";
const token = localStorage.getItem("token"); // Assuming token is stored in localStorage

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [isDefault, setIsDefault] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/`, {
        headers: { "x-access-token": token },
      });
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data?.message);
    }
  };

  // Handle category submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCategoryId) {
        // Update category
        await axios.put(
          `${API_URL}/update/${editCategoryId}`,
          { categoryName, isDefault, monthlyBudget },
          { headers: { "x-access-token": token } }
        );
      } else {
        // Add category
        await axios.post(
          `${API_URL}/add`,
          { categoryName, isDefault, monthlyBudget },
          { headers: { "x-access-token": token } }
        );
      }
      setCategoryName("");
      setMonthlyBudget(0);
      setIsDefault(false);
      setEditCategoryId(null);
      fetchCategories();
    } catch (error) {
      console.error("Error:", error.response?.data?.message);
    }
  };

  // Handle delete category
  const handleDelete = async (categoryId) => {
    try {
      await axios.delete(`${API_URL}/delete/${categoryId}`, {
        headers: { "x-access-token": token },
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error.response?.data?.message);
    }
  };

  // Handle edit category
  const handleEdit = (category) => {
    setCategoryName(category.categoryName);
    setMonthlyBudget(category.monthlyBudget);
    setIsDefault(category.isDefault);
    setEditCategoryId(category._id);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Category Management</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
          className="border p-2 mr-2"
        />
        <input
          type="number"
          placeholder="Monthly Budget"
          value={monthlyBudget}
          onChange={(e) => setMonthlyBudget(Number(e.target.value))}
          className="border p-2 mr-2"
        />
        <label className="mr-2">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />{" "}
          Default
        </label>
        <button type="submit" className="bg-blue-500 text-white p-2">
          {editCategoryId ? "Update" : "Add"}
        </button>
      </form>

      <ul>
        {categories.length === 0 ? (
          <p>No categories available.</p>
        ) : (
          categories.map((category) => (
            <li key={category._id} className="flex justify-between border p-2 mb-2">
              <span>{category.categoryName} (₹{category.monthlyBudget})</span>
              <div>
                <button
                  className="bg-yellow-500 text-white px-2 py-1 mr-2"
                  onClick={() => handleEdit(category)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1"
                  onClick={() => handleDelete(category._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default CategoryPage;
