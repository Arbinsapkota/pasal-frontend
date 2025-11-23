// import React, { SetStateAction } from "react";
// import { Typography } from "@mui/material";
// import axios from "axios";
// import { getTokenFromCookies } from "@/components/cookie/cookie";
// import { toast } from "react-toastify";
// import { Button } from "@/components/ui/button";

// interface Plan {
//   planId: number;
//   planName: string;
//   description: string;
//   price: number;
//   discount: number;
//   durationInDays: number;
// }

// interface PlanListProps {
//   planList: Plan[];
//   onEdit: (plan: Plan) => void;
//   setIsUpdated: React.Dispatch<SetStateAction<boolean>>;
// }

// export const formatDuration = (durationInDays: number) => {
//   const months = Math.floor(durationInDays / 30);
//   const years = Math.floor(months / 12);
//   const remainingMonths = months % 12;
//   return `${years > 0 ? `${years} year${years > 1 ? "s" : ""} ` : ""}${
//     remainingMonths > 0
//       ? `${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`
//       : ""
//   }`;
// };

// const PlanList: React.FC<PlanListProps> = ({
//   planList,
//   onEdit,
//   setIsUpdated,
// }) => {
//   const sortedPlanList = [...planList].sort((a, b) => {
//     const order = ["bronze", "silver", "gold", "platinum"];
//     return (
//       order.indexOf(a.planName.toLowerCase()) -
//       order.indexOf(b.planName.toLowerCase())
//     );
//   });

//   const handleDelete = async (planId: number) => {
//     try {
//       await axios.delete(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership-plans/?id=${planId}`,
//         {
//           headers: { Authorization: `Bearer ${getTokenFromCookies()}` },
//         }
//       );
//       toast.success("Plan deleted successfully");
//       setIsUpdated((prev) => !prev);
//     } catch (error) {
//       toast.error("Failed to delete plan");
//     }
//   };

//   return (
//     <div className="bg-gradient-to-r from-primary/80 via-primary/90  to-primary p-10 rounded-lg">
//       <div className="grid  lg:grid-cols-2 xl:grid-cols-3 gap-6">
//         {sortedPlanList.map((plan) => (
//           <div
//             key={plan.planId}
//             className={`p-6 rounded-lg w-full shadow-xl bg-white ${
//               plan.planName === "Admiral" ? "border-4 border-yellow-500" : ""
//             }`}
//           >
//             {/* <Typography
//               variant="h5"
//               className={`text-xl font-bold mb-4 ${
//                 plan.planName === "Admiral"
//                   ? "text-yellow-500"
//                   : "text-blue-700"
//               }`}
//             > */}
//             <p
//               className={`text-2xl font-bold mb-4 ${
//                 plan.planName === "Admiral"
//                   ? "text-yellow-500"
//                   : "text-blue-700"
//               }`}
//             >
//               {plan.planName}
//             </p>
//             {/* </Typography> */}
//             <Typography
//               variant="h6"
//               className="text-gray-500 mb-6 text-lg font-semibold"
//             >
//               {plan.description}
//             </Typography>
//             <Typography
//               variant="h4"
//               className="font-bold text-gray-700 mb-2 text-start text-2xl"
//             >
//               ${plan.price}
//             </Typography>
//             <Typography
//               variant="body1"
//               className="text-red-500 mb-6 text-start text-lg"
//             >
//               Discount: {plan.discount}%
//             </Typography>
//             <div className="flex justify-between items-center mb-6">
//               <Typography
//                 variant="body1"
//                 className="text-gray-700 text-sm flex items-center"
//               >
//                 <span className="font-bold mr-1">
//                   {formatDuration(plan.durationInDays)}
//                 </span>
//                 Duration
//               </Typography>
//             </div>
//             <div className="flex justify-between">
//               <Button
//                 variant="outline"
//                 color="primary"
//                 className="bg-blue-700 text-white hover:text-white font-bold py-2 rounded-lg shadow-md hover:bg-blue-800"
//                 onClick={() => onEdit(plan)}
//               >
//                 Edit
//               </Button>
//               <Button
//                 variant={"destructive"}
//                 color="secondary"
//                 // className="bg-red-700 text-white font-bold py-2 rounded-lg shadow-md hover:bg-red-800"
//                 onClick={() => handleDelete(plan.planId)}
//               >
//                 Delete
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default PlanList;
