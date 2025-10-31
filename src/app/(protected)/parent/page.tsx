import Reviews from '@/components/Reviews';

export default function ParentHome() {
  const testReviews = [
    {
      teachername: "Dr. Sarah Johnson",
      subject: "Mathematics",
      rating: 4.5,
      description: "Excellent teacher wi ing methods. Makes complex topics easy to understand hjbdshfegfjsdhjdsghjf fdshgfh hfdshfdbhgfdh fhgfdh hgdfhs hgfd hgjfs dfhgdsfsu9ndfioaf jisakjfdhuafnibhcadgfds jashfgufhidufnsaugfuoagfyehfbf jdfbdhfaugfyd ing methods. Makes complex topics easy to understand hjbdshfegfjsdhjdsghjf fdshgfh hfdshfdbhgfdh fhgfdh hgdfhs hgfd hgjfs dfhgdsfsu9ndfioaf jisakjfdhuafnibhcadgfds jashfgufhidufnsaugfuoagfyehfbf jdfbdhfaugfyd ing methods. Makes complex topics easy to understand hjbdshfegfjsdhjdsghjf fdshgfh hfdshfdbhgfdh fhgfdh hgdfhs hgfd hgjfs dfhgdsfsu9ndfioaf jisakjfdhuafnibhcadgfds jashfgufhidufnsaugfuoagfyehfbf jdfbdhfaugfyd th great teaching metho ing methods. Makes complex topics easy to understand hjbdshfegfjsdhjdsghjf fdshgfh hfdshfdbhgfdh fhgfdh hgdfhs hgfd hgjfs dfhgdsfsu9ndfioaf jisakjfdhuafnibhcadgfds jashfgufhidufnsaugfuoagfyehfbf jdfbdhfaugfyd ing methods. Makes complex topics easy to understand hjbdshfegfjsdhjdsghjf fdshgfh hfdshfdbhgfdh fhgfdh hgdfhs hgfd hgjfs dfhgdsfsu9ndfioaf jisakjfdhuafnibhcadgfds jashfgufhidufnsaugfuoagfyehfbf jdfbdhfaugfyd ds. Makes complex topics easy to understand hjbdshfegfjsdhjdsghjf fdshgfh hfdshfdbhgfdh fhgfdh hgdfhs hgfd hgjfs dfhgdsfsu9ndfioaf jisakjfdhuafnibhcadgfds jashfgufhidufnsaugfuoagfyehfbf jdfbdhfaugfyd ."
    },
    {
      teachername: "Prof. Michael Chen",
      subject: "Physics",
      rating: 3.5,
      description: "Good professor with clear explanations and helpful office hours."
    },
    {
      teachername: "Ms. Emily Davis",
      subject: "English Literature",
      rating: 5,
      description: "Amazing teacher who makes literature come alive. Very engaging classes."
    },
    {
      teachername: "Mr. David Wilson",
      subject: "Chemistry",
      rating: 4,
      description: "Knowledgeable teacher with great lab demonstrations and practical examples."
    },
    {
      teachername: "Dr. Lisa Brown",
      subject: "Biology",
      rating: 4.5,
      description: "Passionate about the subject and very supportive of students' learning journeys."
    }
  ];

  return (
    <div>
    <div className="text-sm">Welcome to the parent dashboard.</div>
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teacher Reviews</h1>
      <Reviews reviews={testReviews} />
    </div>
    </div>
  );
}
