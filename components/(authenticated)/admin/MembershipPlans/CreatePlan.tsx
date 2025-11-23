// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { getTokenFromCookies } from "@/components/cookie/cookie";
// import { toast } from "react-toastify";
// import PlanList from "./PlanList";
// import EditPlan from "./EditPlan";
// import { Button } from "@/components/ui/button";

// export interface Plan {
//   planId: number;
//   planName: string;
//   description: string;
//   price: number;
//   discount: number;
//   durationInDays: number;
// }

// type APIError = {
//   response?: {
//     data?: {
//       message?: string;
//     };
//   };
//   message?: string; // General error message
// };

// const CreatePlan: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [planList, setPlanList] = useState<Plan[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
//   const [isUpdated, setIsUpdated] = useState<boolean>(true);

//   const [formData, setFormData] = useState({
//     planName: "",
//     description: "",
//     price: 0,
//     discount: 0,
//     durationInDays: 30,
//   });

//   const planOptions = [
//     { name: "BRONZE", duration: 30 },
//     { name: "SILVER", duration: 90 },
//     { name: "GOLD", duration: 180 },
//     { name: "PLATINUM", duration: 365 },
//   ];

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership-plans/`
//         );
//         setPlanList(response.data);
//         setIsLoading(false);
//       } catch (error) {
//         console.error("There was an error!", error);
//         setIsLoading(false);
//       }
//     };

//     fetchPlans();
//   }, [isUpdated]);

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedPlan = planOptions.find(
//       (plan) => plan.name === e.target.value
//     );
//     if (selectedPlan) {
//       setFormData({
//         ...formData,
//         planName: selectedPlan.name,
//         durationInDays: selectedPlan.duration,
//       });
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     // const { duration, ...submitData } = formData; // Exclude duration from submission
//     try {
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership-plans/`,
//         formData,
//         { headers: { Authorization: `Bearer ${getTokenFromCookies()}` } }
//       );
//       setFormData({
//         planName: "",
//         description: "",
//         price: 0,
//         discount: 0,
//         durationInDays: 30,
//       });
//       setIsUpdated((prev) => !prev);
//       toast.success("Membership plan created successfully!");
//       toggleModal();
//       // Refresh the plan list
//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership-plans/`
//       );
//       setPlanList(response.data);
//     } catch (error: any) {
//       console.error("There was an error creating the plan!", error);
//       if (
//         error?.response?.data?.message ==
//         "Invalid argument: The Plan already exists."
//       ) {
//         toast.error("Plan Already Exists");
//       } else {
//         toast.error("There was an error creating the plan!");
//       }
//       // console.error("Error---------", error.response.data.message);

//       //   if (axios.isAxiosError(error) && error.response) {
//       //     const statusCode = error.response.status;
//       //     if (statusCode === 400) {
//       //       toast.error("Plan already exists.");
//     }
//   };

//   const handleEdit = (plan: Plan) => {
//     setEditingPlan(plan);
//   };

//   const handleEditClose = () => {
//     setEditingPlan(null);
//   };

//   const handleEditSave = async () => {
//     // Refresh the plan list after saving
//     const response = await axios.get(
//       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership-plans/`
//     );
//     setPlanList(response.data);
//     setEditingPlan(null);
//   };

//   return (
//     <div className="relative flex flex-col gap-20 h-screen">
//       <div>
//         <Button
//           onClick={toggleModal}
//           className="absolute top-4 right-4  text-white px-4 py-2 rounded-md"
//         >
//           Create Membership Plan
//         </Button>

//         {isOpen && (
//           <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
//             <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] sm:w-[60%] max-h-[90vh] overflow-y-auto scrollbar-thin">
//               <h2 className="text-2xl font-bold mb-4">Create New Plan</h2>
//               <form onSubmit={handleSubmit}>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 text-sm font-bold mb-2">
//                     Plan Name
//                   </label>
//                   <input
//                     name="planName"
//                     value={formData.planName}
//                     onChange={handleChange}
//                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                   />
//                   {/* <select
//                     name="planName"
//                     value={formData.planName}
//                     onChange={handlePlanChange}
//                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                   >
//                     {planOptions.map((plan) => (
//                       <option key={plan.name} value={plan.name}>
//                         {plan.name}
//                       </option>
//                     ))}
//                   </select> */}
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 text-sm font-bold mb-2">
//                     Duration (days)
//                   </label>
//                   <input
//                     type="number"
//                     name="durationInDays"
//                     value={formData.durationInDays}
//                     onChange={handleChange}
//                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200"
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 text-sm font-bold mb-2">
//                     Description
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 text-sm font-bold mb-2">
//                     Price
//                   </label>
//                   <input
//                     type="number"
//                     name="price"
//                     value={formData.price}
//                     onChange={handleChange}
//                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                   />
//                 </div>
//                 <div className="mb-4">
//                   <label className="block text-gray-700 text-sm font-bold mb-2">
//                     Discount
//                   </label>
//                   <input
//                     type="number"
//                     name="discount"
//                     value={formData.discount}
//                     onChange={handleChange}
//                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                   />
//                 </div>
//                 <div className="flex justify-end">
//                   <button
//                     type="button"
//                     onClick={toggleModal}
//                     className="bg-red-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-red-700"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700"
//                   >
//                     Save
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//       <div>
//         {isLoading ? (
//           <div>Loading...</div>
//         ) : (
//           <PlanList
//             planList={planList}
//             onEdit={handleEdit}
//             setIsUpdated={setIsUpdated}
//           />
//         )}
//       </div>

//       {editingPlan && (
//         <EditPlan
//           plan={editingPlan}
//           onClose={handleEditClose}
//           onSave={handleEditSave}
//         />
//       )}
//     </div>
//   );
// };

// export default CreatePlan;
