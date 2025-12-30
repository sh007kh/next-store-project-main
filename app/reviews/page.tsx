import { deleteReviewAction, fetchProductReviewsByUser } from "@/utils/actions";
import ReviewCard from "@/components/reviews/ReviewCard";
import SectionTitle from "@/components/global/SectionTitle";
import FormContainer from "@/components/form/FormContainer";
import { IconButton } from "@/components/form/Buttons";
import { ReviewGetPayload } from "@/generated/prisma/models/Review";

type ReviewWithProduct = ReviewGetPayload<{
  select: {
    id: true;
    rating: true;
    comment: true;
    product: {
      select: {
        name: true;
        images: {
          select: { imageUrl: true };
          take: 1;
        };
      };
    };
  };
}>;
async function ReviewsPage() {
  const reviews = await fetchProductReviewsByUser();
  if (reviews.length === 0)
    return <SectionTitle text="you have no reviews yet" />;

  return (
    <>
      <SectionTitle text="Your Reviews" />
      <section className="grid md:grid-cols-2 gap-8 mt-4 ">
        {reviews.map((review: ReviewWithProduct) => {
          const { comment, rating } = review;
          const { name, images } = review.product;
          const reviewInfo = {
            comment,
            rating,
            name,
            image: images[0]?.imageUrl || "",
          };
          return (
            <ReviewCard key={review.id} reviewInfo={reviewInfo}>
              <DeleteReview reviewId={review.id} />
            </ReviewCard>
          );
        })}
      </section>
    </>
  );
}

const DeleteReview = ({ reviewId }: { reviewId: string }) => {
  const deleteReview = deleteReviewAction.bind(null, { reviewId });
  return (
    <FormContainer action={deleteReview}>
      <IconButton actionType="delete" />
    </FormContainer>
  );
};

export default ReviewsPage;
