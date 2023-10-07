import React, { useContext, useEffect, useState } from 'react'
import Layout from '../../components/layout/Layout'
import myContext from '../../context/data/myContext';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { doc, getDocs, getDoc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { addToCart } from '../../redux/cartSlice';
import { fireDB } from '../../fireabase/FirebaseConfig';
import { FaHeart, FaComment, FaBookmark, FaEdit, FaTrash, FaUser } from "react-icons/fa";
import CommentForm from '../commentform/CommentForm';
import { auth } from '../../fireabase/FirebaseConfig';
import Comment from 'postcss/lib/comment';
import CommentSection from '../commentform/CommentSection';

function ProductInfo() {
    const context = useContext(myContext);
    const { loading, setLoading, writeComment, getCommentsForPost, getUserEmail, mail } = context;

    const [poststate, setPosts] = useState('')
    const params = useParams()

    const getPostData = async () => {
        setLoading(true)
        try {
            const productTemp = await getDoc(doc(fireDB, "posts", params.id))
            setPosts(productTemp.data());
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    useEffect(() => {
        getPostData()
    }, [])

    async function likePost() {
        const userId = auth.currentUser.uid;
        const postId = params.id;

        const likeRef = doc(fireDB, 'likes', `${userId}_${postId}`);
        const likeDoc = await getDoc(likeRef);

        if (likeDoc.exists() === true) {
            // The user has already liked the post, so "unlike" it
            const updatedVotes = poststate.likes - 1; // Increment the likes
            const updatedPost = {
                ...poststate,
                likes: updatedVotes,
            };

            setPosts(updatedPost);
            toast.dark('Post Downvoted 👎');
            await deleteDoc(likeRef);
        } else {
            // The user hasn't liked the post yet, so "like" it
            const updatedVotes = poststate.likes + 1; // Increment the likes
            const updatedPost = {
                ...poststate,
                likes: updatedVotes,
            };
            // Update the post in the database
            await setDoc(doc(fireDB, 'posts', params.id), updatedPost);
            setPosts(updatedPost);
            toast.success('Post Upvoted 👍');
            await setDoc(likeRef, { userId, postId });
        }
    }



    const dispatch = useDispatch()
    const cartItems = useSelector((state) => state.cart)

    const addCart = (post) => {
        dispatch(addToCart(poststate))
        toast.success('add to cart');
    }

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems])

    const [comments, setComments] = useState([]);

    useEffect(() => {
        // Fetch and set comments when the component mounts
        async function fetchComments() {
            const cmts = await getCommentsForPost(params.id);
            setComments(cmts);
        }

        console.log(comments);

    }, []);

    let [email, setEmail] = useState("");

    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const useremail = await getUserEmail(poststate.author);
                setEmail(useremail);
            } catch (error) {
                // Handle any errors here
                console.error('Error fetching user email:', error);
            }
        };

        const timer = setTimeout(fetchUserEmail, 1000);

        // Clean up the timer if the component unmounts
        return () => clearTimeout(timer);
    }, []);

    return (
        <Layout>
            <section className="text-gray-600 body-font overflow-hidden">
                <div className="container px-5 py-10 mx-auto">
                    {poststate &&
                        <div className="lg:w-4/5 mx-auto flex flex-wrap">
                            <img
                                alt="postImage"
                                className="w-1/2 md:w-2/3 lg:w-2/3 h-auto max-h-[400px] mx-[17%] object-cover object-center rounded"
                                src={poststate.imageUrl}
                            />
                            {/* <img
                                alt="postImage"
                                className="lg:w-1/3 w-[400px] lg:h-[400px] fit-content object-cover object-center rounded"
                                src={poststate.imageUrl}
                            /> */}
                            <div className="lg:w-2/3 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0 mx-[17%]">
                                {/* AUTHOR ABC */}
                                <h2 className="text-sm title-font text-gray-500 tracking-widest">
                                    Author: {poststate.author ? poststate.author : "Rashid"}
                                </h2>
                                <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">
                                    {poststate.title}
                                </h1>
                                <div className="flex mb-4">
                                    <span className="flex items-center">

                                        <span className="text-gray-600 ml-[150px]">{poststate.likes ? poststate.likes : 0} Upvotes</span>

                                    </span>
                                    <span className="flex ml-3 pl-3 py-2 border-l-2 border-gray-200 space-x-2s">
                                        <a className="text-gray-500">
                                            <svg
                                                fill="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                className="w-5 h-5"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                            </svg>
                                        </a>
                                        <a className="text-gray-500">
                                            <svg
                                                fill="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                className="w-5 h-5"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                            </svg>
                                        </a>
                                        <a className="text-gray-500">
                                            <svg
                                                fill="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                className="w-5 h-5"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                                            </svg>
                                        </a>
                                    </span>
                                </div>
                                <p className="leading-relaxed border-b-2 mb-5 pb-5">
                                    {poststate.description}
                                </p>

                                <p className="leading-relaxed border-b-2 mb-5 pb-5 text-red-500">
                                    {poststate.language}
                                </p>

                                <p className="leading-relaxed border-b-2 mb-5 pb-5">
                                    {poststate.code}
                                </p>

                                <div className="flex">
                                    <button onClick={() => likePost()} className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded">
                                        Upvote Now
                                    </button>

                                    <button onClick={() => likePost()} className="rounded-full w-10 h-10 bg-gray-200 p-0 border-0 inline-flex items-center justify-center text-gray-500 ml-4">
                                        <svg
                                            fill="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex flex-row items-center my-10 w-[300px] mx-[20%]">
                                    <button className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-6 rounded-l-lg focus:outline-none w-1/2">
                                        Start a Thread
                                    </button>
                                    <div className="bg-indigo-500 text-white py-2 px-4 rounded-r-lg w-1/2 flex items-center justify-center">
                                        <FaComment className="text-2xl" />
                                    </div>
                                </div>

                                {/* <div className='my-4'>
                                    <p className='text-2xl font-semibold text-blue-700 underline mb-4 my-1'>COMMENT SECTION</p>
                                </div> */}

                                <CommentForm post_id={params.id} />

                            </div>
                        </div>}

                    <CommentSection postId={params.id} />
                </div>
            </section>

        </Layout>
    )
}

export default ProductInfo