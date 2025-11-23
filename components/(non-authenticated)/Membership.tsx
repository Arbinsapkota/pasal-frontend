// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useModal } from "../providers/ModalStateProvider";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "../ui/card";
// import { useRouter } from "next/navigation";
// import { getUserFromCookies } from "../cookie/cookie";
// import { Button } from "../ui/button";

// export interface Plan {
//   planId: string;
//   planName: string;
//   description: string;
//   discount: number;
//   durationInDays: number;
//   price: number;
//   createdAt: string; // Use `Date` if you want to parse it as a Date object
//   updatedAt: string; // Use `Date` if you want to parse it as a Date object
// }

// const Membership: React.FC = () => {
//   const {
//     isSignupModalOpen,
//     isLoginModalOpen,
//     closeSignupModal,
//     openLoginModal,
//     closeLoginModal,
//     setIsLoginModalOpen,
//     setIsMemberModalOpen,
//     setPlan,
//   } = useModal();
//   const router = useRouter();
//   const [planList, setPlanList] = useState<Plan[]>([]);
//   const [isMembershipModalOpen, setIsMembershipModalOpen] =
//     useState<boolean>(false);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const user = getUserFromCookies();

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership-plans/`
//         );
//         const sortedPlanList = [...response.data].sort((a, b) => {
//           const order = ["bronze", "silver", "gold", "platinum"];
//           return (
//             order.indexOf(a.planName.toLowerCase()) -
//             order.indexOf(b.planName.toLowerCase())
//           );
//         });
//         setPlanList(sortedPlanList);
//         // setIsLoading(false);
//       } catch (error) {
//         console.error("There was an error!", error);
//         // setIsLoading(false);
//       }
//     };

//     fetchPlans();
//   }, []);
//   const getPlanGradient = (planName: string) => {
//     switch (planName) {
//       case "BRONZE":
//         return "bg-gradient-to-r from-[#D98A3E] to-[#A56738]"; // Lighter bronze
//       case "SILVER":
//         return "bg-gradient-to-r from-[#C0C0C0] to-[#A9A9A9]"; // Silver shades
//       case "GOLD":
//         return "bg-gradient-to-r from-[#FFD700] to-[#DAA520]"; // Gold shades
//       case "PLATINUM":
//         return "bg-gradient-to-r from-[#E5E4E2] to-[#B0C4DE]"; // Platinum shades
//       default:
//         return "bg-gradient-to-r from-[#F5F5F5] to-[#D3D3D3]"; // Default shades (neutral)
//     }
//   };
//   const handleMembershipSelect = (item: Plan) => {
//     if (!user) {
//       setIsLoginModalOpen(true);
//       setIsMembershipModalOpen(false);
//     } else {
//       setPlan(item);
//       setIsMembershipModalOpen(false);
//       setIsMemberModalOpen(true);
//     }
//   };

//   return (
//     <div className="m-4">
//       <h1 className="text-3xl font-bold text-center mb-8">Membership Plans</h1>
//       <div className="flex flex-col items-center">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
//           {planList.map((plan) => (
//             <Card
//               key={plan.planId}
//               className={`shadow-lg ${getPlanGradient(
//                 plan.planName
//               )} w-full mx-auto`} // Adjusted width
//             >
//               <CardHeader>
//                 <CardTitle className="text-xl font-semibold">
//                   {plan.planName}
//                 </CardTitle>
//                 <CardDescription className="text-sm">
//                   {plan.description}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-2">
//                 <p className="text-lg font-medium">Price: ${plan.price}</p>
//                 <p className="text-lg font-medium">
//                   Duration: {plan.durationInDays} days
//                 </p>
//                 <p className="text-lg font-medium">
//                   Discount: {plan.discount}%
//                 </p>
//                 <Button
//                   className="py-3 mt-4 w-full bg-green-500 hover:bg-green-600"
//                   onClick={() => handleMembershipSelect(plan)}
//                 >
//                   Join Us
//                 </Button>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Membership;
