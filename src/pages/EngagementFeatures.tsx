import { useState, useEffect } from 'react';
import { Hand, PieChart, MessageCircleQuestion } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Socket } from 'socket.io-client';

interface Poll {
  id: string;
  question: string;
  options: string[];
  results: Record<string, number>;
  status: 'active' | 'ended';
}

interface Question {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  answered: boolean;
}

interface HandRaisedEvent {
  userId: string;
  userName: string;
}

interface PollResultsEvent {
  pollId: string;
  results: Record<string, number>;
}

interface QuestionAnsweredEvent {
  questionId: string;
}

interface EngagementFeaturesProps {
  socket: Socket;
  roomId: string;
  userId: string;
  userName: string;
  isInstructor: boolean;
}

const EngagementFeatures = ({
  socket,
  roomId,
  userId,
  userName,
  isInstructor
}: EngagementFeaturesProps) => {
  // State management
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', '']
  });
  const [newQuestion, setNewQuestion] = useState('');

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('handRaised', ({ userId: _userId, userName: raiserName }: HandRaisedEvent) => {
      // Handle hand raise notification
      console.log(`${raiserName} raised their hand`);
    });

    socket.on('pollCreated', (poll: Poll) => {
      setPolls(prev => [...prev, poll]);
    });

    socket.on('pollResults', ({ pollId, results }: PollResultsEvent) => {
      setPolls(prev => prev.map(poll => 
        poll.id === pollId ? { ...poll, results } : poll
      ));
    });

    socket.on('questionAsked', (question: Question) => {
      setQuestions(prev => [...prev, question]);
    });

    socket.on('questionAnswered', ({ questionId }: QuestionAnsweredEvent) => {
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, answered: true } : q
      ));
    });

    return () => {
      socket.off('handRaised');
      socket.off('pollCreated');
      socket.off('pollResults');
      socket.off('questionAsked');
      socket.off('questionAnswered');
    };
  }, [socket]);

  // Hand raising
  const toggleHand = () => {
    setIsHandRaised(!isHandRaised);
    if (!isHandRaised) {
      socket.emit('raiseHand', { roomId, userId, userName });
    } else {
      socket.emit('lowerHand', { roomId, userId });
    }
  };

  // Polling functions
  const createPoll = () => {
    const poll: Poll = {
      id: Date.now().toString(),
      question: newPoll.question,
      options: newPoll.options.filter(opt => opt.trim() !== ''),
      results: {},
      status: 'active'
    };
    socket.emit('createPoll', { roomId, poll });
    setShowPollDialog(false);
    setNewPoll({ question: '', options: ['', ''] });
  };

  const submitPollAnswer = (pollId: string, answer: string) => {
    socket.emit('submitPollAnswer', { roomId, pollId, userId, answer });
  };

  const endPoll = (pollId: string) => {
    socket.emit('endPoll', { roomId, pollId });
  };

  // Q&A functions
  const askQuestion = () => {
    if (newQuestion.trim()) {
      const question: Question = {
        id: Date.now().toString(),
        userId,
        userName,
        text: newQuestion,
        timestamp: new Date().toISOString(),
        answered: false
      };
      socket.emit('askQuestion', { roomId, question });
      setNewQuestion('');
    }
  };

  const markQuestionAnswered = (questionId: string) => {
    socket.emit('markQuestionAnswered', { roomId, questionId });
  };

  return (
    <div className="fixed bottom-20 right-4 flex flex-col gap-2">
      {/* Rest of the JSX remains the same */}
      {/* Previous implementation's JSX copied here */}
      {/* Hand raise button */}
      <Button
        variant={isHandRaised ? "secondary" : "outline"}
        size="icon"
        onClick={toggleHand}
        className="rounded-full"
      >
        <Hand className={`h-4 w-4 ${isHandRaised ? 'text-blue-500' : ''}`} />
      </Button>

      {/* Poll button (instructor only) */}
      {isInstructor && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowPollDialog(true)}
          className="rounded-full"
        >
          <PieChart className="h-4 w-4" />
        </Button>
      )}

      {/* Q&A button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowQuestionsDialog(true)}
        className="rounded-full"
      >
        <MessageCircleQuestion className="h-4 w-4" />
      </Button>

      {/* Poll creation dialog */}
      <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Poll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input
                value={newPoll.question}
                onChange={(e) => setNewPoll(prev => ({
                  ...prev,
                  question: e.target.value
                }))}
                placeholder="Enter your question..."
              />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              {newPoll.options.map((option, index) => (
                <Input
                  key={index}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newPoll.options];
                    newOptions[index] = e.target.value;
                    setNewPoll(prev => ({ ...prev, options: newOptions }));
                  }}
                  placeholder={`Option ${index + 1}`}
                />
              ))}
              <Button
                variant="outline"
                onClick={() => setNewPoll(prev => ({
                  ...prev,
                  options: [...prev.options, '']
                }))}
              >
                Add Option
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createPoll}>Create Poll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Q&A dialog */}
      <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Questions & Answers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question..."
              />
              <Button onClick={askQuestion}>Ask</Button>
            </div>
            <div className="space-y-2">
              {questions.map(question => (
                <Card key={question.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{question.text}</p>
                      <p className="text-sm text-gray-500">
                        Asked by {question.userName} at{' '}
                        {new Date(question.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {isInstructor && !question.answered && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markQuestionAnswered(question.id)}
                      >
                        Mark Answered
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active polls display */}
      {polls.map(poll => poll.status === 'active' && (
        <Card key={poll.id} className="p-4 max-w-md">
          <h4 className="font-medium mb-2">{poll.question}</h4>
          <RadioGroup onValueChange={(value: string) => submitPollAnswer(poll.id, value)}>
            {poll.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${poll.id}-${index}`} />
                <Label htmlFor={`${poll.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {isInstructor && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => endPoll(poll.id)}
            >
              End Poll
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
};

export default EngagementFeatures;