// import { axiosAuthInstance } from "@/components/axiosInstance";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useState } from "react";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import { toast } from "react-toastify";
// import { formatDate } from "../admin/GymMembers/datatable";
// import { Button } from "@/components/ui/button";
// import axios from "axios";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { useModal } from "@/components/providers/ModalStateProvider";

// interface Membership {
//   id: string;
//   users: null; // Replace `null` with appropriate type if users is expected to be non-null in the future
//   shippingInfo: null; // Replace `null` with appropriate type if shippingInfo is expected to be non-null in the future
//   planName: string;
//   price: number;
//   membershipStartDate: string; // Can be replaced with `Date` if parsing is handled
//   membershipEndDate: string; // Can be replaced with `Date` if parsing is handled
//   membershipStatus: string;
//   updatedAt: string; // Can be replaced with `Date` if parsing is handled
// }

// interface User {
//   id: string;
//   firstName: string;
//   lastName: string;
//   shippingInfo: null; // Replace `null` with appropriate type if shippingInfo is expected to be non-null in the future
//   memberShipList: Membership[];
// }

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

// const GymMembership: React.FC = () => {
//   // const [membership, setMembership] = useState<MembersShip>({
//   //   startDate: new Date(2024, 0, 1), // January 1, 2024
//   //   endDate: new Date(2024, 11, 31), // December 31, 2024
//   //   isActive: true,
//   // });

//   const { setIsMemberModalOpen, setPlan } = useModal();
//   const [isUpdated, setIsUpdated] = useState<boolean>(false);

//   const [memberDetails, setMemberDetails] = useState<User | undefined>();
//   const router = useRouter();
//   const today = new Date();

//   const [planList, setPlanList] = useState<Plan[]>([]);
//   // const daysLeft = differenceInDays(memberDetails?.memberShipList?.[0]?.membershipEndDate, today);

//   // const renewMembership = (months: number): void => {
//   //   const newEndDate = addMonths(membership.endDate, months);
//   //   setMembership({ ...membership, endDate: newEndDate });
//   // };

//   // Function to highlight the remaining days on the calendar
//   // const highlightRemainingDays = ({ date }: { date: Date }): string | null => {
//   //   if (
//   //     isWithinInterval(date, { start: today, end: membership.endDate }) &&
//   //     date >= today
//   //   ) {
//   //     return "highlight-days";
//   //   }
//   //   return null;
//   // };

//   useEffect(() => {
//     axiosAuthInstance()
//       .get("api/memberships/gym-members")
//       .then((res) => {
//         setMemberDetails(res.data);
//       })
//       .catch((err) => console.error("Error fetching member Details", err));

//     const fetchPlans = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/membership-plans/`
//         );
//         // const sortedPlanList = [...response.data].sort((a, b) => {
//         //   const order = ["bronze", "silver", "gold", "platinum"];
//         //   return (
//         //     order.indexOf(a.planName.toLowerCase()) -
//         //     order.indexOf(b.planName.toLowerCase())
//         //   );
//         // });
//         setPlanList(response.data);
//         // setIsLoading(false);
//       } catch (error) {
//         console.error("There was an error!", error);
//         // setIsLoading(false);
//       }
//     };

//     fetchPlans();
//   }, [isUpdated]);

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

//   function renewPlan(planName: string) {
//     axiosAuthInstance()
//       .post("/api/memberships/", {
//         planName,
//       })
//       .then((res) => {
//         toast.success("Payment in progress...");
//         router.push(res.data?.paymentUrl);
//       })
//       .catch((err) => {
//         toast.error("Please try again later");
//         console.error("Error creating membership", err);
//       });
//   }

//   const handleMembershipSelect = (item: Plan) => {
//     setPlan(item);
//     // setIsMembershipModalOpen(false);
//     setIsMemberModalOpen(true);
//   };

//   const deactivateMember = (userId: string, membershipId: string) => {
//     axiosAuthInstance()
//       .post("/api/memberships/update-status", {
//         users: {
//           userId: userId,
//         },
//         membershipStatus: "INACTIVE",
//         id: membershipId,
//       })
//       .then((res) => {
//         toast.success("Membership Deactivated Successfully.");
//         setIsUpdated((prev) => !prev);
//       })
//       .catch((err) => {
//         toast.error("Failed to Deactivate Membership. ");
//       });
//   };

//   return (
//     <div className="p-5 max-w-auto mx-auto border rounded-lg shadow-lg bg-white">
//       <h2 className="text-2xl font-bold text-center mb-4">Gym Membership</h2>

//       {memberDetails &&
//         memberDetails?.memberShipList &&
//         memberDetails?.memberShipList?.map((membership, index) => {
//           const endDate = new Date(membership?.membershipEndDate);
//           const currentDate = new Date();
//           let daysLeft = 0;
//           if (
//             endDate instanceof Date && // Ensure endDate is a valid Date object
//             !isNaN(endDate.getTime()) && // Check that endDate is not an invalid date
//             currentDate instanceof Date && // Ensure currentDate is a valid Date object
//             !isNaN(currentDate.getTime()) // Check that currentDate is not an invalid date
//           ) {
//             const timeDiff = endDate.getTime() - currentDate.getTime();
//             daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
//           }
//           return (
//             <div
//               key={index}
//               className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center my-8"
//             >
//               <div>
//                 <p className="font-semibold text-xl sm:text-2xl py-2">
//                   {membership?.planName}
//                 </p>
//                 <p>
//                   <strong>Start Date:</strong>{" "}
//                   {formatDate(membership?.membershipStartDate)}
//                 </p>
//                 <p>
//                   <strong>End Date:</strong>{" "}
//                   {formatDate(membership?.membershipEndDate)}
//                 </p>
//                 <p>
//                   <strong>Status:</strong>{" "}
//                   {membership?.membershipStatus == "ACTIVE"
//                     ? "Active"
//                     : "Inactive"}
//                 </p>
//                 <p>
//                   <strong>Days Left:</strong>{" "}
//                   <span className="bg-yellow-300 px-2 py-1 rounded">
//                     {daysLeft}
//                   </span>
//                 </p>
//                 <div className="flex mt-4">
//                   <Button
//                     variant={"destructive"}
//                     className=""
//                     disabled={membership?.membershipStatus == "INACTIVE"}
//                     onClick={() => {
//                       deactivateMember(memberDetails.id, membership?.id);
//                     }}
//                   >
//                     Deactivate
//                   </Button>
//                 </div>
//               </div>
//               <Calendar
//                 value={membership?.membershipEndDate}
//                 tileDisabled={({ date }) => date < today}
//                 // tileClassName={highlightRemainingDays}
//               />
//             </div>
//           );
//         })}
//       <h1 className="mt-10 mb-4 text-lg font-semibold">Available Plans </h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
//         {planList.map((plan) => (
//           <Card
//             key={plan.planId}
//             className={`shadow-lg ${getPlanGradient(
//               plan.planName
//             )} w-full mx-auto`} // Adjusted width
//           >
//             <CardHeader>
//               <CardTitle className="text-xl font-semibold">
//                 {plan.planName}
//               </CardTitle>
//               <CardDescription className="text-sm">
//                 {plan.description}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <p className="text-lg font-medium">Price: ${plan.price}</p>
//               <p className="text-lg font-medium">
//                 Duration: {plan.durationInDays} days
//               </p>
//               <p className="text-lg font-medium">Discount: {plan.discount}%</p>
//               <Button
//                 className="py-3 mt-4 w-full bg-green-500 hover:bg-green-600"
//                 onClick={() => handleMembershipSelect(plan)}
//               >
//                 Join Us
//               </Button>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* <div className="text-center">
//         <button
//           onClick={() => renewPlan("BRONZE")}
//           className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded m-2"
//         >
//           Renew for 1 Month
//         </button>
//         <button
//           onClick={() => renewPlan("SILVER")}
//           className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded m-2"
//         >
//           Renew for 3 Months
//         </button>
//         <button
//           onClick={() => renewPlan("GOLD")}
//           className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded m-2"
//         >
//           Renew for 6 Months
//         </button>
//         <button
//           onClick={() => renewPlan("PLATINUM")}
//           className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded m-2"
//         >
//           Renew for A Year
//         </button>
//       </div> */}
//     </div>
//   );
// };

// export default GymMembership;
