// data.ts (Mock data or fetch from API)
export const getAssignmentsData = () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    const labels = [];
    const totalAssignments = [];
    const ongoingAssignments = [];
  
    for (let i = 0; i < 30; i++) {
      const date = new Date(lastMonth);
      date.setDate(date.getDate() + i);
      labels.push(date.toDateString());
  
      // Mock data: replace with actual data fetching
      totalAssignments.push(Math.floor(Math.random() * 10) + 1);
      ongoingAssignments.push(Math.floor(Math.random() * 5) + 1);
    }
  
    return { labels, totalAssignments, ongoingAssignments };
  };
  