// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { getTokenFromCookies } from "@/components/cookie/cookie";
// import { toast } from "react-toastify";

// interface Plan {
//   planId: number;
//   planName: string;
//   description: string;
//   price: number;
//   discount: number;
//   durationInDays: number;
// }

// interface EditPlanProps {
//   plan: Plan | null;
//   onClose: () => void;
//   onSave: () => void;
// }

// const EditPlan: React.FC<EditPlanProps> = ({ plan, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     planId: 0,
//     planName: "",
//     description: "",
//     price: 0,
//     discount: 0,
//     durationInDays: 0,
//   });

//   useEffect(() => {
//     if (plan) {
//       setFormData({
//         planId: plan.planId,
//         planName: plan.planName,
//         description: plan.description,
//         price: plan.price,
//         discount: plan.discount,
//         durationInDays: plan.durationInDays,
//       });
//     }
//   }, [plan]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership-plans/`,
//         formData,
//         { headers: { Authorization: `Bearer ${getTokenFromCookies()}` } }
//       );
//       toast.success("Plan updated successfully");

//       onSave();
//     } catch (error) {
//       toast.error("Failed to update plan");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] sm:w-[60%]">
//         <h2 className="text-2xl font-bold mb-4">Edit Membership Plan</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Plan Name
//             </label>
//             <input
//               type="text"
//               name="planName"
//               value={formData.planName}
//               onChange={handleChange}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Price
//             </label>
//             <input
//               type="number"
//               name="price"
//               value={formData.price}
//               onChange={handleChange}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Discount
//             </label>
//             <input
//               type="number"
//               name="discount"
//               value={formData.discount}
//               onChange={handleChange}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Duration (days)
//             </label>
//             <input
//               type="number"
//               name="durationInDays"
//               value={formData.durationInDays}
//               onChange={handleChange}
//               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             />
//           </div>
//           <div className="flex justify-end">
//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-red-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-red-700"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700"
//             >
//               Save
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditPlan;
