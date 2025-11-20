import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';
import { useState } from 'react';

export default function EventDetails() {
  const eventId = useParams()
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['event', eventId.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: eventId ? eventId.id : null })
  })


  const { mutate, isPending, isError: deleteisError, error: deleteError } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' })
      navigate('../');
    }
  })

  function deletingEvent() {
    setIsDeleting(true)
  }
  function notdeletingEvent() {
    setIsDeleting(false)
  }
  function handleRemoveEvent() {
    mutate({ id: eventId.id })
    console.log("d")
  }
  let content


  if (isLoading) {
    content = <LoadingIndicator />
  }

  if (isError) {
    console.log(isError);
    content = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch '} />
    );
  }

  if (data) {
    content = <article id="event-details">
      <header>
        <h1>{data.title}</h1>
        <nav>
          <button onClick={deletingEvent}>Delete</button>
          <Link to="edit">Edit</Link>
        </nav>
      </header>
      <div id="event-details-content">
        <img src={data ? `http://localhost:3000/${data.image}` : ''} alt="" />
        <div id="event-details-info">
          <div>
            <p id="event-details-location">{data.location}</p>
            <time dateTime={`Todo-DateT$Todo-Time`}>{data.date}</time>
          </div>
          <p id="event-details-description">{data.description}</p>
        </div>
      </div>
    </article>
  }
  return (
    <>
      {
        isDeleting && <Modal>

          <h1>Are you Sure?</h1>
          {isPending && <p>Deleting Please wait....</p>}
          {
            !isPending && <div className="form-actions">

              <button className='button' onClick={handleRemoveEvent}>Yes</button>
              <button className='button' onClick={notdeletingEvent}>No</button>
            </div>
          }
          {deleteisError && <ErrorBlock title="An error occurred" message={deleteError.info?.message || 'Failed to fetch '} />}
        </Modal>
      }
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      {content}
    </>
  );
}
