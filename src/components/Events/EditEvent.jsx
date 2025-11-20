import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';



export default function EditEvent() {




  const navigate = useNavigate();

  const eventId = useParams()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['event', eventId.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: eventId ? eventId.id : null })
  })


  const { mutate, isPending, isError: deleteisError, error: deleteError } = useMutation({
    mutationFn: updateEvent,
    onMutate:  async (data)=>{
      const { id, event: newEventData } = data; 
            
      await queryClient.cancelQueries({ queryKey: ['event', id] });
      
      const previousEvent = queryClient.getQueryData(['event', id]);
      queryClient.setQueryData(['event', id], newEventData);
      navigate('../');
      return { previousEvent };
    }
  })
   
  function handleSubmit(formData) { 
    mutate({id:eventId.id,event:formData})
  }

  function handleClose() {
    navigate('../');
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
   content= <EventForm inputData={data} onSubmit={handleSubmit}>
      {isPending && <p>Editing Event....</p>}
      {!isPending && <>

        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </>}
      </EventForm>
  }






  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
